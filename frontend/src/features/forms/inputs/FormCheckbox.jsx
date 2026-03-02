import { Box, FormLabel, Checkbox, FormHelperText } from "@mui/joy";
import { actions } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { FeatureContext } from "../../../context/FeatureContext";

const FormCheckbox = ({ id, label, helper, repeaterContext, titlePosition = 'before', sx, errors }) => {
	const dispatch = useDispatch();
	const { feature } = useContext(FeatureContext);

	const { setField, setRepeaterField } = actions[feature] || {};
	if (!setField) {
		console.error(`No actions found for feature: ${feature}`);
		return null;
	}
	const { repeater, index, fieldKey } = repeaterContext || {};
	const value = useSelector((state) => {
		if (repeaterContext) {
			return state[feature]?.repeaters?.[repeater]?.[index]?.[fieldKey];
		}
		return ((state)[feature]?.form?.fields[id]?.value) ?? false;
	});


	return (
		<Box sx={sx}>
            {titlePosition === 'before' && (
                <FormLabel htmlFor={id} sx={{ mr: 1 }}>{label}</FormLabel>
            )}
			<Checkbox
				id={id}
				checked={!!value}
				onChange={e => {
					if (repeaterContext) {
						dispatch(
							setRepeaterField({
								repeater,
								index,
								field: fieldKey,
								value: e.target.checked,
							})
						);
					} else {
						dispatch(setField({ field: id, value: e.target.checked }))
					}
				}}
			/>
            {titlePosition === 'after' && (
                <FormLabel htmlFor={id} sx={{ ml: 1 }}>{label}</FormLabel>
            )}
			<FormHelperText sx={{ color: (errors ?? []).length ? "red" : "" }}>
				{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
			</FormHelperText>
		</Box>
	);
};

export default FormCheckbox;
