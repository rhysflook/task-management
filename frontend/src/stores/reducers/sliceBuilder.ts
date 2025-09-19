/**
 * @file sliceBuilder.ts
 * @description The purpose of this file is to build slices by inputing a base config, defining other common functionality reducers and combining them.
 *  For example, a feature may require both forms and table and therefore the sliceBuilder will combine the two with the base config.
 */
import { ActionReducerMapBuilder, createSlice, Slice, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { FeatureConfig } from "../../types/features/features";
import { getTableFeature } from "./tableReducers";
import { getFormFeature } from "./formReducers";



interface CombinedSlice<T> {
	name: string;
	initialState: FeatureConfig;
	reducers: ValidateSliceCaseReducers<T, SliceCaseReducers<T>>;
	features: string[];

	applyExtraReducers?: (builder: ActionReducerMapBuilder<T>) => void;
	selectors?: {
		[key: string]: (state: T) => void;
	};
  }

export interface MergableSlice<T extends FeatureConfig> {
	initialState: FeatureConfig;
	reducers: ValidateSliceCaseReducers<T, SliceCaseReducers<T>>;
	extraReducers: (builder: ActionReducerMapBuilder<T>) => void;
	selectors?: {
		[key: string]: (state: T) => void;
	};
}

export function combineSlices<T extends FeatureConfig>({name, initialState, reducers, features, applyExtraReducers, selectors={}}: CombinedSlice<T>): Slice<T> {

	const slices = [] as MergableSlice<T>[];

	features.forEach((feature) => {
		switch (feature) {
			case 'table':
				slices.push(
					getTableFeature<T>({
						name,
						state: initialState,
					}));
				break;
			case 'form':
				slices.push(getFormFeature<T>({
					name,
					state: initialState,
				}));
				break;
			default:
				break;
		}
	});

	return createSlice({
		name,
		initialState: {...initialState, ...slices.reduce((acc, slice) => {
			return {
				...acc,
				...slice.initialState,
			};
		}, initialState)} as T,
		reducers: {
			...slices.reduce((acc, slice) => {
				return {
					...acc,
					...slice.reducers,
				};
			}, {}),
			...reducers,
		},
		extraReducers: (builder: ActionReducerMapBuilder<T>) => {
			if (applyExtraReducers) {
				applyExtraReducers(builder);
			}
			slices.forEach((slice) => {
				if (slice.extraReducers) {
					slice.extraReducers(builder);
				}
			});
		},
		selectors: {
				...slices.reduce((acc, slice) => {
					return {
						...acc,
						...slice.selectors,
					};
				}, {}),
				...selectors,
		}
	});
}

export {};