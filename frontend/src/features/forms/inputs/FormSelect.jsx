import { useDispatch, useSelector } from "react-redux";
import { actions, store } from "../../../stores/store";
import { Box, FormControl, FormHelperText, FormLabel, Select, Option, Autocomplete } from "@mui/joy";
import { useContext, useEffect, useState } from "react";
import { FeatureContext } from "../../../context/FeatureContext";
import { callbacks } from "./callbacks";

const FormSelect = ({ options, label, helper, sx, id, errors, controlledValue,
    repeaterContext, mode, onLoadCallback, loadCallbackScope,disabled, nullable = false, searchable = true }) => {
    const dispatch = useDispatch();
    const { feature } = useContext(FeatureContext);
    const featureActions = actions[feature];
    const { setField, setOptions } = actions[feature];
    const [loadedOptions, setLoadedOptions] = useState(options);

    if (!featureActions) {
        return null;
    }

    useEffect(() => {
        if (options && options.length > 0) {
            setLoadedOptions(options);
        }
    }, [options]);

    const { value: reduxValue } = useSelector((state) => {
        return ((state)[feature]?.form?.fields[id]) ?? { value: "" }
    });

    const form = useSelector((state) => state[feature]?.form || {});

    const fullState = useSelector((state) => state[feature]);
    // Execute loadCallback only once on mount
    useEffect(() => {
        if (onLoadCallback && mode == 'edit') {
            const {newOptions, newValue, idToUpdate} = callbacks[onLoadCallback](form, fullState, repeaterContext);
            if (newValue && newValue != reduxValue) {
                dispatch(setField({field: idToUpdate ?? id, value: newValue}));
            }
            if (newOptions && newOptions != loadedOptions) {
                // setLoadedOptions(newOptions);
                dispatch(setOptions({field: idToUpdate ?? id, options: newOptions}));
            }
        }
    }, [onLoadCallback]);

    // Handle change for repeater field
    const handleRepeaterChange = (event, newValue) => {
        const { repeater, index, fieldKey } = repeaterContext;
        dispatch(
            featureActions.setRepeaterField({
                repeater,
                index,
                field: fieldKey,
                value: newValue,
            })
        );
    };

    // Handle change for regular form field
    const handleFormChange = (event, newValue) => {
        dispatch(
            featureActions.setField({
                field: id,
                value: newValue,
            })
        );
    };

    // --- REPEATER CASE ---
    if (repeaterContext) {
        const { repeater, index, fieldKey } = repeaterContext;
    
        // Get value from Redux repeater
        const value = useSelector((state) => {
            const val =
                state[feature]?.repeaters?.[repeater]?.[index]?.[fieldKey] ??
                controlledValue ??
                "";
            return val;
        });
    
        // Get options: check optionsByIndex first, then fallback to allOptions/options
        const usedOptions = useSelector((state) => {
            const fieldDef = state[feature]?.form?.fields?.[repeater]?.fields?.[fieldKey];
            
            // Priority: optionsByIndex[index] > passed options > allOptions > options 
            return fieldDef?.optionsByIndex?.[index] || loadedOptions || fieldDef?.allOptions || fieldDef?.options || [];
        });
    
    
        let isDisabled = false;
        
        if (typeof disabled === "function") {
            // disabled is a callback → evaluate it
            isDisabled = disabled(mode);
        } else if (typeof disabled === "string") {
            // disabled is a string → treat as a single mode
            isDisabled = callbacks[disabled](form, mode, store.getState()[feature], id, repeaterContext);
        } else if (Array.isArray(disabled)) {
            // disabled is an array → check inclusion
            isDisabled = disabled.includes(mode);
        }
        
        return (
            <Box sx={sx}>
                <FormControl>
                    <FormLabel>{label}</FormLabel>
                    {isDisabled ? (
                        <Select
                            value={value ?? ""}
                            onChange={handleRepeaterChange}
                            disabled
                        >
                            {(usedOptions || []).map((option) => (
                                <Option key={option.id} value={option.id}>
                                    {option.name}
                                </Option>
                            ))}
                        </Select>
                    ) : (
                        <Select
                            value={value ?? ""}
                            onChange={handleRepeaterChange}
                        >
                            {(nullable && !isDisabled) && <Option value="">--</Option>}
                            {(usedOptions || []).map((option) => (
                                <Option key={option.id} value={option.id}>
                                    {option.name}
                                </Option>
                            ))}
                        </Select>
                    )}
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                        <FormHelperText sx={{ 
                            color: (errors ?? []).length ? 'red' : '',
                        }}>
                            {(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
                        </FormHelperText>
                    </Box>
                </FormControl>
            </Box>
        );
    }

    // --- REGULAR FORM FIELD CASE ---
    const reduxField = useSelector((state) => {
        return state[feature]?.form?.fields[id] ?? { value: "" };
    });
  
    const value = controlledValue !== undefined ? controlledValue : reduxField.value;

    const handleChange = (newValue) => {
        if (newValue !== undefined && newValue !== null && newValue !== "") {
            dispatch(setField({ field: id, value: newValue }));
        }
    };

    const setupOptions = () => {
        const filteredOptions = [];
        let passedOptions = options || [];
        passedOptions.forEach(option => {
            if (option.scope && mode && !option.scope.includes(mode)) {
                return;
            }
            filteredOptions.push(option);
        });
        return filteredOptions;
    }

    return (
        <Box sx={sx}>
			<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                    <FormLabel>{label}</FormLabel>

                    {searchable ? (
                        <Autocomplete
                            options={setupOptions() || []}
                            value={loadedOptions?.find(o => o.id === value) || null}
                            getOptionLabel={(option) => option?.name ?? ''}
                            onChange={(event, newValue) => handleChange(newValue?.id)}
                            sx={{ width: "100%" }}
                        />
                    ) : (
                        <Select
                            value={value || ""}
                            onChange={(event, newValue) => handleChange(newValue)}
                        >
                            {(setupOptions() || []).map((option) => (
                                <Option key={option.id} value={option.id}>
                                    {option.name}
                                </Option>
                            ))}
                        </Select>
                    )}
                </Box>

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
					<FormHelperText sx={{ 
						color: (errors ?? []).length ? 'red' : '',
					}}>
						{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
					</FormHelperText>
				</Box>
            </Box>
        </Box>
    );
};

export default FormSelect;
