import { current } from "@reduxjs/toolkit";
import { callbacks } from "../../features/forms/inputs/callbacks";
import { formApi } from "../../services/form";

export function getFormFeature({name, state, actions}) {
	const initialState = {
		...state,
		form: {
			loaded: false,
			fields: state.fields ?? {},
			actions: actions ?? {},
			extraData: {},
			errors: {},
			initialLoad: true,
			redirectAfterSave: {
				shouldRedirect: false,
				targetPage: null,      // e.g., 'unitMaps', etc.
				contextData: null      // any data needed to restore context (floor, etc.)
			},
			// Pre-fill data for new forms
			prefillData: null
		}
	};

	return {
		initialState,
		reducers: {
			setField(state, action) {
				const targetField = state.form?.fields[action.payload.field];
				const useCallback = action.payload.useCallback == undefined ? true : action.payload.useCallback;
				if ((targetField && 'onChangeCallback' in targetField) && useCallback) {
					if (Array.isArray(targetField.onChangeCallback)) {
						targetField.onChangeCallback.forEach(callback => {
							state.form.fields = {
								...state.form.fields,
								...callbacks[callback](state.form.fields, action.payload.value),
							}
						})
					}
				}
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
			setOptions (state, action, options = []) {
				if (state.form) {
					state.form = {
						...state.form,
						fields: {
							...state.form.fields,
							[action.payload.field]: {
								...state.form.fields[action.payload.field],
								options: action.payload.options ?? [],
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
			},
			clearAllFields(state) {
				if (state.form) {
					Object.keys(state.form.fields).forEach((key) => {
						state.form.fields[key].value = "";
						state.form.fields[key].errors = [];
					});
				}	
			},
			toggleLoaded(state) {
				if (state.form) {
					state.form.loaded = !state.form.loaded;
				}
			},
			clearErrors: (state) => {
				if (!state.form || !state.form.fields) return;
				Object.keys(state.form.fields).forEach((key) => {
					if (state.form.fields[key]?.errors && state.form.fields[key].errors.length > 0) {
					state.form.fields[key].errors = [];
					}
				});
			},
			resetInitialLoad(state) {
				if (state.form) {
					state.form.initialLoad = true;
				}
			},  
			setRedirectAfterSave(state, action) {
			/**
			 * Sets redirect configuration and context data for navigation after save
			 * @param {Object} state - Current state
			 * @param {Object} action.payload - Redirect configuration
			 * @param {string} action.payload.targetPage - Page identifier to redirect to
			 * @param {Object} action.payload.contextData - Data to restore context (floor, filters, etc.)
			 */
				if (state.form) {
					state.form.redirectAfterSave = {
						shouldRedirect: true,
						targetPage: action.payload.targetPage,
						contextData: action.payload.contextData || null
					};
				}
			},
			clearRedirectAfterSave(state) {
			// Clears redirect configuration after navigation is complete
				if (state.form) {
					state.form.redirectAfterSave = {
						shouldRedirect: false,
						targetPage: null,
						contextData: null
					};
				}
			},
			setPrefillData(state, action) {
			/**
			 * Sets data to pre-fill form fields (e.g., bed assignment, unit, etc.)
			 * @param {Object} state - Current state
			 * @param {Object} action.payload - Data to prefill in form
			 */
				if (state.form) {
					state.form.prefillData = action.payload;
				}
			},
			clearPrefillData(state) {
			// Clears prefill data after form is initialized
				if (state.form) {
					state.form.prefillData = null;
				}
			},
		},
		extraReducers: (builder) => {
			builder.addMatcher(formApi.endpoints.getFormData.matchFulfilled, (state, action) => {
				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]) => {
						const keys = key.split(':'); // get the part before the first colon
						if (keys.length >= 3)
							key = keys[2];
						else
							key = keys[0];

						if (key.split('.').length > 1) {
							// Nested field (e.g., repeater field)
							const [repeaterName, fieldName] = key.split('.');
							if (state.form && state.form.fields[repeaterName] && state.form.fields[repeaterName].fields) {
								state.form = {
									...state.form,
									fields: {
										...state.form.fields,
										[repeaterName]: {
											...state.form.fields[repeaterName],
											fields: {
												...state.form.fields[repeaterName].fields,
												[fieldName]: {
													...state.form.fields[repeaterName].fields[fieldName],
													options: Array.isArray(option) ? option : [],
												},
											},
										},
									},
								};
							}
						} else if (state.form && state.form.fields[key]) {
							// console.log(action.payload.data.extra_data);
							state.form = {
								...state.form,
								extraData: action.payload.data.extra_data || {},
								fields: {
									...state.form.fields,
									[key]: {
										...state.form.fields[key],
										allOptions: Array.isArray(option) ? option : [],
										options: Array.isArray(option) ? option : [],
									},
								},
							};
						}
					})
				}
				state.form.loaded = true;
			})
			.addMatcher(formApi.endpoints.getRecord.matchFulfilled, (state, action) => {

				if (action.payload.data.options) {
					Object.entries(action.payload.data.options).forEach(([key, option]) => {
						if (state.form && state.form.fields[key]) {
							state.form = {
								...state.form,
								loaded: true,
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
								loaded: true,
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
					// console.log(current(state));
					// if ("getRecordCallback" in current(state)) {
					// 	state = callbacks[current(state).getRecordCallback](current(state), action);
					// }
				}
				
			})
			.addMatcher(
				formApi.endpoints.createRecord.matchFulfilled,
				(state, action) => {
					if (state.form) {
						state.form.initialLoad = false;
					}
				}
			)
			.addMatcher(formApi.endpoints.createRecord.matchRejected, (state, action) => {

				if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
					state.form = {
						...state.form,
						loaded: true,
						errors: action.payload,
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
			})
			.addMatcher(formApi.endpoints.editRecord.matchRejected, (state, action) => {
				if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
					state.form = {
						...state.form,
						loaded: true,
						errors: action.payload,
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
			})
			;
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
			},
			selectRedirectAfterSave: (state) => state.form?.redirectAfterSave,
		}
	}
};
