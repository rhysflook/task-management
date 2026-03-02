/**
 * @file sliceBuilder.js
 * @description Builds Redux slices by combining base config with feature-specific reducers.
 * Supports table, form, and repeater features.
 * 
 * Example: A feature may require forms, tables, and repeaters.
 * The sliceBuilder combines all three with the base config.
 */

import { createSlice } from "@reduxjs/toolkit";
import { getTableFeature } from "./tableReducers";
import { getFormFeature } from "./formReducers";
import { getRepeaterFeature } from "./repeaterReducers";

/**
 * Combines multiple feature slices into a single Redux slice
 * 
 * @param {Object} config - Slice configuration
 * @param {string} config.name - Name of the slice
 * @param {Object} config.initialState - Initial state object
 * @param {Object} config.reducers - Custom reducers
 * @param {Array<string>} config.features - Features to include (e.g., ['table', 'form'])
 * @param {Array<string>} config.repeaters - Repeater names (e.g., ['beds', 'rooms'])
 * @param {Function} config.applyExtraReducers - Apply additional extra reducers
 * @param {Object} config.selectors - Custom selectors
 * @param {Object} config.actions - Action configurations
 * @returns {Slice} Combined Redux slice
 */
export function combineSlices({
    name,
    initialState,
    reducers,
    features,
    repeaters = [], // Array of repeater names
    applyExtraReducers,
    selectors,
    actions,
    cascadeOnDelete = [],
    checkBeforeDeletion = false,
    deletionConfirmationMessage = null,
}) {
    const slices = [];

    // Process each requested feature
    features.forEach((feature) => {
        switch (feature) {
            case 'table':
                slices.push(
                    getTableFeature({
                        name,
                        state: initialState,
                        cascadeOnDelete,
                        checkBeforeDeletion,
                        deletionConfirmationMessage,
                    })
                );
                break;
            case 'form':
                slices.push(
                    getFormFeature({
                        name,
                        state: initialState,
                        actions
                    })
                );
                break;
            default:
                break;
        }
    });

    // Add repeater feature if repeaters are specified
    if (repeaters.length > 0) {
        slices.push(
            getRepeaterFeature({
                name,
                repeaters,
                state: initialState,
            })
        );
    }

    // Combine all slices into one
    return createSlice({
        name,
        initialState: {
            ...initialState,
            ...slices.reduce((acc, slice) => {
                return {
                    ...acc,
                    ...slice.initialState,
                };
            }, initialState)
        },
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