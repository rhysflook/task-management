import { ActionReducerMapBuilder, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from "@reduxjs/toolkit";
import { FeatureConfig } from "../../types/features/features";
import { formApi, IFormData, IOptions } from "../../services/form";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface FormArgs {
  name: string;
  state: FeatureConfig;
}

export function getFormFeature<T extends FeatureConfig>({name, state}: FormArgs) {
	const initialState: FeatureConfig = {
		...state,
		form: {
			fields: state.fields ?? {},
			actions: {
				'create': [
					'createAndOpen'
				],
				'edit': [
					'editAndOpen',
					'delete'
				]
			}
		}
	};

	return {
		initialState,
		reducers: {
			setField(state: T, action: {payload: {field: string, value: any}}) {
				console.log(action.payload.value);
				if (state.form) {
					state.form = {
						...state.form,
						fields: {
							...state.form.fields,
							[action.payload.field]: {
								...state.form.fields[action.payload.field],
								value: action.payload.value,
								errors: [],
							},
						},
					};
				}
			},
			clearField(state: T, action: {payload: string}) {
				if (state.form) {
					delete state.form.fields[action.payload];
				}
			},
			clearForm(state: T) {
				if (state.form) {
					state.form.fields = {};
				}
			}
		} as ValidateSliceCaseReducers<T, SliceCaseReducers<T>>,
		extraReducers: (builder: ActionReducerMapBuilder<T>) => {
			builder.addMatcher(formApi.endpoints.getFormData.matchFulfilled, (state, action: {payload: IFormData}) => {
				console.log(action.payload.data);
				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]: [string, IOptions]) => {
						if (state.form && state.form.fields[key]) {
							state.form = {
								...state.form,
								fields: {
									...state.form.fields,
									[key]: {
										...state.form.fields[key],
										options: Array.isArray(option) ? option : [],
									},
								},
							};
						}
					})
				}
			})
			.addMatcher(formApi.endpoints.getRecord.matchFulfilled, (state, action: {payload: IFormData}) => {
				console.log(action.payload.data.record);

				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]: [string, IOptions]) => {
						if (state.form && state.form.fields[key]) {
							state.form = {
								...state.form,
								fields: {
									...state.form.fields,
									[key]: {
										...state.form.fields[key],
										options: Array.isArray(option) ? option : [],
									},
								},
							};
						}
					})
				}
				if (action.payload.data.record) {
					Object.entries(action.payload.data.record).forEach(([key, value]) => {
						if (state.form && state.form.fields[key]) {
							state.form = {
								...state.form,
								fields: {
									...state.form.fields,
									[key]: {
										...state.form.fields[key],
										value: value,
									},
								},
							};
						}
					})
				}
			})
			.addMatcher(formApi.endpoints.createRecord.matchRejected, (state, action: PayloadAction<FetchBaseQueryError | undefined>) => {
				if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
					console.log(action);
					state.form = {
						...state.form,
						fields: {
							...state.form?.fields,
							...Object.entries(action.payload).reduce((acc, [key, value]) => {
								return {
									...acc,
									[key]: {
										...state.form?.fields[key],
										errors: value,
									}
								}
							}
							, {}),
						},
					};
				}
			});
		},
		selectors: {
			selectFormInputs: (state: T) => {
				const requestObj: {
					[key: string]: any
					relationships: Record<string, any>
				} = {
					"relationships": {}
				};
				if (state.form) {
					Object.entries(state.form.fields).forEach(([key, field]) => {
						if (field.relationship) {
							requestObj.relationships[field.relationship.split('/')[1]] = field.value.map((item: any) => item.id);
						} else {
							requestObj[key] = field.value;
						}
					});
				}
				return requestObj;
			}
		}
	}
};
