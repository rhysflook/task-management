import { Box, FormHelperText, FormLabel, Input } from "@mui/joy"
import { actions } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { FeatureContext } from "../../../context/FeatureContext";
import { callbacks } from "./callbacks";

const FormDateTimePicker = ({ id, label, helper, sx, errors, onRenderCallback, hasTime=false }) => {
	const dispatch = useDispatch();
	const { feature } = useContext(FeatureContext);

	const { setField } = actions[feature] || {};
	if (!setField) {
		console.error(`No actions found for feature: ${feature}`);
		return null;
	}
	const { value } = useSelector((state) => {
		return ((state)[feature]?.form?.fields[id]) ?? { value: "" }
	});

	let dateValue = value;
	if (!dateValue) {
		if (onRenderCallback && callbacks[onRenderCallback]) {
			dateValue = callbacks[onRenderCallback]();
			dispatch(setField({ field: id, value: dateValue }));
		}	
	}
	return (
		<Box sx={sx}>
			<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
					<FormLabel htmlFor={id}>{label}</FormLabel>
					<Input
						id={id}
						type={hasTime ? "datetime-local" : "date"}
						value={dateValue || ''}
						onChange={(e) => 
							dispatch(setField({ field: id, value: e.currentTarget.value }))
						}
						sx={{ width: '100%' }}
					/>
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

export default FormDateTimePicker;
