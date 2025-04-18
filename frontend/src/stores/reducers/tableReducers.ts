import { ActionReducerMapBuilder, createSlice, Draft, Slice, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { IRecords, tablesApi } from "../../services/tables";
import { TableConfig } from "../../types/tables/table";
import { PayloadAction } from '@reduxjs/toolkit';


interface TableSlice<T> {
  name: string;
  initialState: T;
  reducers: ValidateSliceCaseReducers<T, SliceCaseReducers<T>>;
  applyExtraReducers?: (builder: ActionReducerMapBuilder<T>) => void;
}

export const tableInitialState = {
	name: "",
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
}

export const tableReducers = <T extends TableConfig>() => ({
	getPage(state: Draft<T>, action?: PayloadAction<string>) {
		console.log('triggered', action?.payload)
	  state.queryString = `${state.name}/tableData?page=${action?.payload}&per_page=${state.meta.per_page}&fields=${state.fields?.join(',')}`;
	},
  });

export const tableExtraReducers = <T>(builder: ActionReducerMapBuilder<T>) => {
	builder.addMatcher(tablesApi.endpoints.getRecords.matchFulfilled, (state, action: {payload: IRecords}) => {
	(state as TableConfig).records = action.payload['data'];
	(state as TableConfig).links = action.payload['links'];
	(state as TableConfig).meta = action.payload['meta'];
	});
}

export function applyTableSlice<T extends TableConfig>({name, initialState, reducers, applyExtraReducers}: TableSlice<Partial<T>>): Slice<T> {
	const mergedInitialState: T = {
		...tableInitialState,
		...initialState as T,
		queryString: `${name}/tableData?page=${tableInitialState.meta.current_page}&per_page=${tableInitialState.meta.per_page}&fields=${initialState.fields?.join(',')}`,
		name
	};
	const baseReducers = tableReducers<T>();
	return createSlice({
		name,
		initialState: mergedInitialState,
		reducers: {
			...baseReducers,
			...reducers,
		},
		extraReducers: (builder: ActionReducerMapBuilder<T>) => {
			tableExtraReducers<T>(builder);
			if (applyExtraReducers) {
				applyExtraReducers(builder);
			}
		}
	});
}
