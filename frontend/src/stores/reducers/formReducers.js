import { formApi } from "../../services/form";

export function getFormFeature({name, state, actions}) {
	const initialState = {
		...state,
		form: {
			fields: state.fields ?? {},
			actions: actions ?? {},
		}
	};

	return {
		initialState,
		reducers: {
			setField(state, action) {
				console.log(action.payload.value, action.payload.field);
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
			clearField(state, action) {
				if (state.form) {
					delete state.form.fields[action.payload];
				}
			},
			clearForm(state) {
				if (state.form) {
					state.form.fields = {};
				}
			}
		},
		extraReducers: (builder) => {
			builder.addMatcher(formApi.endpoints.getFormData.matchFulfilled, (state, action) => {
				console.log(action.payload.data);
				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]) => {
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
			.addMatcher(formApi.endpoints.getRecord.matchFulfilled, (state, action) => {
				console.log(action.payload.data.record);

				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]) => {
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
			.addMatcher(formApi.endpoints.createRecord.matchRejected, (state, action) => {
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
			selectFormInputs: (state) => {
				const requestObj = {
					"relationships": {}
				};
				if (state.form) {
					Object.entries(state.form.fields).forEach(([key, field]) => {
						if (field.relationship) {
							requestObj.relationships[field.relationship.split('/')[1]] = field.value.map((item) => item.id);
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
