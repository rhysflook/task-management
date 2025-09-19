import { ActionReducerMapBuilder, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { IRecords, tablesApi } from "../../services/tables";
import { TableColumn } from "../../types/tables/table";
import { PayloadAction } from '@reduxjs/toolkit';
import { selectFields } from "../../helpers/table";
import { FeatureConfig } from "../../types/features/features";

interface TableArgs {
  name: string;
  state: FeatureConfig;
}

export function getTableFeature<T extends FeatureConfig>({name, state}: TableArgs) {
	const fields = selectFields(state.columns ?? []);
	const initialState: FeatureConfig = {
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
			getPage(state: T, action?: PayloadAction<string>) {
				const fields = selectFields(state.columns as TableColumn[]);
				if (state.table) {
					state.table.queryString = `${state.name}/tableData?page=${action?.payload}&per_page=${state.table.meta.per_page}&fields=${fields?.join(',')}`;
				}
			},
			setPerPage(state: T, action: PayloadAction<string>) {
				const fields = selectFields(state.columns as TableColumn[]);
				if (state.table) {
					state.table.queryString = `${state.name}/tableData?page=1&per_page=${action.payload}&fields=${fields?.join(',')}`;
				}
			},
		  } as ValidateSliceCaseReducers<T, SliceCaseReducers<T>>,
		extraReducers: (builder: ActionReducerMapBuilder<T>) => {

			builder.addMatcher(tablesApi.endpoints.getRecords.matchFulfilled, (state, action: {payload: IRecords}) => {
				if (state.table) {
					state.table.records = action.payload['data'];
					state.table.links = action.payload['links'];
					state.table.meta = action.payload['meta'];
				}
			});
		}
	}
};
