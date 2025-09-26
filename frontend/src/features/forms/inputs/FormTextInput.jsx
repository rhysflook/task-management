import { Box, FormHelperText, FormLabel, Input } from "@mui/joy"
import { actions } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";

const FormTextInput = ({ feature, id, label, helper, sx, errors }) => {
	const dispatch = useDispatch();
	const { setField } = actions[feature] || {};
	if (!setField) {
		console.error(`No actions found for feature: ${feature}`);
		return null;
	}
	const { value } = useSelector((state) => {
		return ((state)[feature]?.form?.fields[id]) ?? { value: "" }
	});
	return (
		<Box sx={sx}>
			<FormLabel>{label}</FormLabel>
			<Input
				value={value ?? ""}
				onChange={(e) =>
					dispatch(setField({ field: id, value: e.currentTarget.value }))
				}
			/>
			<FormHelperText sx={{ color: (errors ?? []).length ? "red" : "" }}>
				{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
			</FormHelperText>
		</Box>
	);
};

export default FormTextInput;
