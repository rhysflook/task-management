import { tablesApi } from "../../services/tables";
import { selectFields } from "../../helpers/table";

export function getTableFeature({ name, state }) {
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
				per_page: 5,
			},
			queryString: `${name}/tableData?page=1&per_page=5&fields=${fields?.join(',')}`,
		}
	};

	return {
		initialState,
		reducers: {
			getPage(state, action) {
				const fields = selectFields(state.columns);
				if (state.table) {
					state.table.queryString = `${state.name}/tableData?page=${action?.payload}&per_page=${state.table.meta.per_page}&fields=${fields?.join(',')}`;
				}
			},
			setPerPage(state, action) {
				const fields = selectFields(state.columns);
				if (state.table) {
					state.table.queryString = `${state.name}/tableData?page=1&per_page=${action.payload}&fields=${fields?.join(',')}`;
				}
			},
		},
		extraReducers: (builder) => {
			builder.addMatcher(tablesApi.endpoints.getRecords.matchFulfilled, (state, action) => {
				if (state.table) {
					state.table.records = action.payload['data'];
					state.table.links = action.payload['links'];
					state.table.meta = action.payload['meta'];
				}
			});
		}
	}
};
