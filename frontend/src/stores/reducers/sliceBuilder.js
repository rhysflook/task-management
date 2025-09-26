/**
 * @file sliceBuilder.js
 * @description The purpose of this file is to build slices by inputing a base config, defining other common functionality reducers and combining them.
 *  For example, a feature may require both forms and table and therefore the sliceBuilder will combine the two with the base config.
 */
import { createSlice } from "@reduxjs/toolkit";
import { getTableFeature } from "./tableReducers";
import { getFormFeature } from "./formReducers";

export function combineSlices({name, initialState, reducers, features, applyExtraReducers, selectors, actions}) {

	const slices = [];

	features.forEach((feature) => {
		switch (feature) {
			case 'table':
				slices.push(
					getTableFeature({
						name,
						state: initialState,
					}));
				break;
			case 'form':
				slices.push(getFormFeature({
					name,
					state: initialState,
					actions
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
		}, initialState)},
		reducers: {
			...slices.reduce((acc, slice) => {
				return {
					...acc,
					...slice.reducers,
				};
			}, {}),
			...reducers,
		},
		extraReducers: (builder) => {
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
