import { tablesApi } from "../../services/tables";
import { selectFields } from "../../helpers/table";
import FormSelect from "../../features/forms/inputs/FormSelect";
import { formApi } from "../../services/form";
import { current } from "@reduxjs/toolkit";

export function getTableFeature({ name, state, cascadeOnDelete = [], checkBeforeDeletion = false, deletionConfirmationMessage = null }) {
	const fields = selectFields(state.columns ?? []);
	const initialState = {
		...state,
		table: {
			name: name,
			columns: state.columns ?? [],
			records: [],
			links: {
				self: "",
				next: "",
				prev: "",
			},
			meta: {
				total: 0,
				current_page: 1,
				last_page: 0,
				per_page: 50,
			},
			// Persist current filters used to build queryString
			filters: {},
			// Nonce used to force refetch even when filters are unchanged
			refreshNonce: 0,
			queryString: `${name}/tableData?page=1&per_page=50&fields=${fields?.join(',')}`,
			cascadeOnDelete: cascadeOnDelete,
			checkBeforeDeletion: checkBeforeDeletion,
			deletionConfirmationMessage: deletionConfirmationMessage,
			searchOptions: {}, // To hold options for searchable fields, populated from API response
		}
	};

	const mapFilterValue = (key, value, columns, fields) => {
		// console.log('Mapping filter:', { key, value, columns, fields });
		const column = columns.find(c => c.key === key);
		const field = fields?.[key];
		
		// console.log('Found column:', column);
		// console.log('Found field:', field);

		// Case 1: valueMap in column definition
		if (column?.valueMap) {
			const dbValue = Object.entries(column.valueMap)
				.find(([_, label]) => label === value)?.[0];
			// console.log('ValueMap result:', dbValue);
			if (dbValue !== undefined) {  // Check undefined instead of falsy
				return dbValue;
			}
		}
		
		// Case 2: Static options in field definition
		if (field?.options && Array.isArray(field.options)) {
			const option = field.options.find(opt => opt.name === value || opt.id === value);
			// console.log('Options result:', option);
			if (option) {  // Check if option exists
				return option.id;
			}
		}
		
		// Case 3: Value is already correct (or no mapping found)
		return value;
	};
	
	const buildQueryString = (name, page, perPage, fields, filters, nonce) => {
		const fieldsParam = fields?.join(',') ?? '';
		const filtersQuery = buildFiltersQuery(filters);
		const nonceParam = nonce ? `&_k=${nonce}` : '';
		
		return `${name}/tableData?page=${page}&per_page=${perPage}&fields=${fieldsParam}${filtersQuery}${nonceParam}`;
	};

	// Helper to build filter query params
	const buildFiltersQuery = (filters) => {
		if (!filters) return '';
		const parts = [];
		for (const [k, v] of Object.entries(filters)) {
			if (v === '' || v === null || v === undefined) continue;
			parts.push(`filter[${encodeURIComponent(k)}]=${encodeURIComponent(String(v))}`);
		}
		return parts.length ? `&${parts.join('&')}` : '';
	};

	return {
		initialState,
		reducers: {
			getPage(state, action) {
				const fields = selectFields(state.columns);
				if (state.table) {
					const page = action?.payload ?? 1;
					const perPage = state.table.meta.per_page;
					const filtersQuery = buildFiltersQuery(state.table.filters);
					const noncePart = state.table.refreshNonce ? `&_k=${state.table.refreshNonce}` : '';
					state.table.queryString = `${state.name}/tableData?page=${page}&per_page=${perPage}&fields=${fields?.join(',')}${filtersQuery}${noncePart}`;
				}
			},
			setPerPage(state, action) {
				const fields = selectFields(state.columns);
				if (state.table) {
					const perPage = action.payload ?? 5;
					const filtersQuery = buildFiltersQuery(state.table.filters);
					const noncePart = state.table.refreshNonce ? `&_k=${state.table.refreshNonce}` : '';
					state.table.queryString = `${state.name}/tableData?page=1&per_page=${perPage}&fields=${fields?.join(',')}${filtersQuery}${noncePart}`;
				}
			},
			// Set or clear filters and rebuild the queryString
			setFilters(state, action) {
				if (!state.table) return;
				
				const rawFilters = action?.payload ?? {};
				const mappedFilters = {};
				
				for (const [key, value] of Object.entries(rawFilters)) {
					mappedFilters[key] = mapFilterValue(
						key,
						value,
						state.columns,
						state.fields
					);
				}
				
				state.table.filters = mappedFilters;
				state.table.refreshNonce = (state.table.refreshNonce ?? 0) + 1;
				
				const fields = selectFields(state.columns);
				
				state.table.queryString = buildQueryString(
					state.name,
					1,
					state.table.meta.per_page,
					fields,
					mappedFilters,
					state.table.refreshNonce
				);
			},
	
		},
		extraReducers: (builder) => {
			builder.addMatcher(tablesApi.endpoints.getRecords.matchFulfilled, (state, action) => {
				if (state.table) {
					state.table.records = action.payload['data'];
					state.table.links = action.payload['links'];
					state.table.meta = action.payload['meta'];
					state.table.searchOptions = action.payload['search_options'] ?? {};
				}
			}),
			builder.addMatcher(tablesApi.endpoints.deleteRecord.matchFulfilled, (state, action) => {

				const recordId = action.meta.arg.originalArgs.url.split('/').pop();
				const records = state.table.records.filter(record => {
					return record.id != recordId;
				});
				state.table.records = records;
			});
		}
	}}