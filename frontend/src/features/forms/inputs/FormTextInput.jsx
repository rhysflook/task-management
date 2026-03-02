/**
 * @file FormTextInput.jsx
 * @description Text input component that supports both regular forms and repeaters
 */

import { Box, Button, FormHelperText, FormLabel, Input } from "@mui/joy";
import { actions, store } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { FeatureContext } from "../../../context/FeatureContext";
import { setRepeaterField } from "../../../stores/reducers/roomSlice";
import { callbacks } from "./callbacks";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

const FormTextInput = ({ id, label, helper, sx, errors, type, controlledValue, repeaterContext, mode, max, onRenderCallback, disabled }) => {
    const dispatch = useDispatch();
    const { feature } = useContext(FeatureContext);
    const { repeater, index, fieldKey } = repeaterContext || {};
    const [ passwordVisible, setPasswordVisible ] = useState(false);
    const handleRepeaterChange = (e) => {
      const { repeater, index, fieldKey } = repeaterContext;
        dispatch(
          setRepeaterField({
            repeater,
            index,
            field: fieldKey,
            value: e.currentTarget.value,
          })
        );
    };


    /**
     * Handle change for regular form field
     */
    const handleFormChange = (e) => {
      dispatch(
        setField({
          field: id,
          value: e.currentTarget.value,
        })
      );
    };

    const form = useSelector((state) => state[feature]?.form || {});
    const reduxField = useSelector((state) => {
      return state[feature]?.form?.fields[id] ?? { value: "" };
    });

    const value = repeaterContext ? useSelector((state) => {
      const val = state[feature]?.repeaters?.[repeater]?.[index]?.[fieldKey] ?? controlledValue ?? "";
      return val;
    }) : controlledValue !== undefined ? controlledValue : reduxField.value;

    const { setField } = actions[feature] || {};
    if (!setField) {
      console.error(`No actions found for feature: ${feature}`);
      return null;
    }
    const { value: reduxValue } = useSelector((state) => {
      return ((state)[feature]?.form?.fields[id]) ?? { value: "" }
    });
    const [ localValue, setLocalValue ] = useState(
      type === "password" ? "" : reduxValue
    );
    useEffect(() => {
      setLocalValue(reduxValue);
    }, [reduxValue, type]);

    if (onRenderCallback) {
      const newValue = callbacks[onRenderCallback](form, mode);
      if (newValue && newValue !== reduxValue) {
        dispatch(setField({ field: id, value: newValue }));
      }
    }

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
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Box sx={{ display: repeaterContext ? '' : 'flex', 
            alignItems: 'center', justifyContent: 'space-between', gap: 2 
          }}>
            <FormLabel htmlFor={id}>{label}</FormLabel>
            <Input
              id={id}
              disabled={isDisabled}
              type={type === "password" ? (passwordVisible ? "text" : "password") : "text"}
              value={type === "password" ? localValue : value}
              autoComplete="off"
              slotProps={{ input: { maxLength: max } }}
              onChange={(e) => { 
                if (type === "password") {
                  setLocalValue(e.currentTarget.value)
                }
                if (repeaterContext) {
                  handleRepeaterChange(e);
                } else {
                  handleFormChange(e);
                }
              }}
              sx={{ width: type == "password" ? "90%" : '100%'  }}
            />
            {type === "password" && <RemoveRedEyeIcon onClick={() => setPasswordVisible(!passwordVisible)} sx={{ color: passwordVisible ? "#0ea5e9" : "gray", cursor: "pointer" }} />}
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

export default FormTextInput;