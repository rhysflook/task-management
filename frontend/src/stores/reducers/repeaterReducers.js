/**
 * @file repeaterReducers.js
 * @description Provides repeater feature reducers for managing dynamic arrays of items.
 * Handles CRUD operations on repeater items stored in Redux.
 * 
 * Structure in Redux:
 * state[feature].repeaters[repeaterName] = [
 *   { field1: value1, field2: value2 },
 *   { field1: value3, field2: value4 },
 * ]
 */

import { callbacks } from "../../features/forms/inputs/callbacks";

/**
 * Creates a repeater feature with all necessary reducers
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.name - Feature name (e.g., 'rooms')
 * @param {Array<string>} config.repeaters - Array of repeater names (e.g., ['beds'])
 * @param {Object} config.state - Initial state
 * @returns {Object} Repeater feature object with initialState and reducers
 */
export function getRepeaterFeature({ name, repeaters, state }) {
    return {
        initialState: {
            repeaters: {}, // Will hold all repeater arrays
        },
        reducers: {
            /**
             * Add a new empty item to a repeater
             * 
             * @param {Object} state - Current state
             * @param {Object} action - Action with payload: { repeater: string }
             */
            addRepeaterItem: (state, action) => {
                const { repeater } = action.payload || {};
                const repeaterName = repeater || repeaters[0]; // Default to first repeater if not specified

                if (!state.repeaters) {
                    state.repeaters = {};
                }
                if (!state.repeaters[repeaterName]) {
                    state.repeaters[repeaterName] = [];
                }
                
                // Add empty object - fields will populate as user types
                state.repeaters[repeaterName].push({});
            },

            /**
             * Remove an item from a repeater by index
             * 
             * @param {Object} state - Current state
             * @param {Object} action - Action with payload: { repeater: string, index: number }
             */
            removeRepeaterItem: (state, action) => {
                const { repeater, index } = action.payload;
                                
                // Remove the item from the repeater array
                if (state.repeaters?.[repeater]) {
                    state.repeaters[repeater].splice(index, 1);
                }       
            
                // Execute onRemoveCallback if any field has it defined
                const repeaterFields = state.form?.fields?.[repeater]?.fields || {};
                Object.values(repeaterFields).forEach(fieldDef => {
                    if (fieldDef.onRemoveCallback) {
                        const callback = callbacks[fieldDef.onRemoveCallback];
                        if (callback) {
                            callback(state, repeater);
                        }
                    }
                });
            },

            /**
             * Update a specific field of a repeater item
             * 
             * @param {Object} state - Current state
             * @param {Object} action - Action with payload: { repeater: string, index: number, field: string, value: any }
             */
            setRepeaterField: (state, action) => {
                const { repeater, index, field, value } = action.payload;

                // Initialize structure if it doesn't exist
                if (!state.repeaters) {
                    state.repeaters = {};
                }
                if (!state.repeaters[repeater]) {
                    state.repeaters[repeater] = [];
                }
                if (!state.repeaters[repeater][index]) {
                    state.repeaters[repeater][index] = {};
                }
                
                // Set the field value
                state.repeaters[repeater][index][field] = value;

                // Execute callbacks
                executeFieldCallbacks(state, repeater, index, field, value);
            },

            /**
             * Load initial data for a repeater (e.g., from API response)
             * 
             * @param {Object} state - Current state
             * @param {Object} action - Action with payload: { repeater: string, items: Array }
             */
            loadRepeaterItems: (state, action) => {
                const { repeater, items } = action.payload;
                
                if (!state.repeaters) {
                    state.repeaters = {};
                }
                state.repeaters[repeater] = items;
            },

            /**
             * Clear all items from a repeater
             * 
             * @param {Object} state - Current state
             * @param {Object} action - Action with payload: { repeater: string }
             */
            clearRepeater: (state, action) => {
                const { repeater } = action.payload;
                
                if (state.repeaters?.[repeater]) {
                    state.repeaters[repeater] = [];
                }
            },

            /**
             * Clear all repeaters
             * 
             * @param {Object} state - Current state
             */
            clearAllRepeaters: (state) => {
                state.repeaters = {};
            },
        },
        selectors: {
            /**
             * Select all items from a specific repeater
             */
            selectRepeaterItems: (state, repeaterName) => {
                return state.repeaters?.[repeaterName] || [];
            },

            /**
             * Select a specific item from a repeater
             */
            selectRepeaterItem: (state, repeaterName, index) => {
                return state.repeaters?.[repeaterName]?.[index] || {};
            },

            /**
             * Get the count of items in a repeater
             */
            selectRepeaterCount: (state, repeaterName) => {
                return state.repeaters?.[repeaterName]?.length || 0;
            },
        },
    };
}

/**
 * Helper function to execute field callbacks
 * Extracted to be reusable by both setRepeaterField and removeRepeaterItem
 */
const executeFieldCallbacks = (state, repeater, index, field, value) => {
    const fieldDefinition = state.form?.fields?.[repeater]?.fields?.[field];

    if (fieldDefinition && 'onChangeCallback' in fieldDefinition) {
        if (Array.isArray(fieldDefinition.onChangeCallback)) {
            fieldDefinition.onChangeCallback.forEach(callbackName => {
                const callback = callbacks[callbackName];
                
                if (callback) {
                    const repeaterFields = state.form?.fields?.[repeater]?.fields || {};
                    const repeaterContext = { repeater, index, field };
                    
                    // Execute callback - returns { indexUpdates: { index: { fieldKey: { options: [...] } } } }
                    const callbackResult = callback(repeaterFields, value, state, repeaterContext);

                    // Apply results - store options indexed by item position
                    if (callbackResult && callbackResult.indexUpdates) {
                        Object.entries(callbackResult.indexUpdates).forEach(([itemIndex, itemUpdate]) => {
                            Object.entries(itemUpdate).forEach(([fieldKey, fieldUpdate]) => {
                                if (fieldUpdate.options) {
                                    const targetField = state.form.fields[repeater].fields[fieldKey];
                                    
                                    // Initialize optionsByIndex if needed
                                    if (!targetField.optionsByIndex) {
                                        targetField.optionsByIndex = {};
                                    }
                                    
                                    // Store options for this specific item index
                                    targetField.optionsByIndex[itemIndex] = fieldUpdate.options;
                                }
                            });
                        });
                    }
                }
            });
        }
    }
};