import { Box, FormHelperText, FormLabel, Input } from "@mui/joy"
import { useAppDispatch } from "../../../stores/hooks";
import { setField } from "../../../stores/reducers/projectSlice";

interface FormTextInputProps {
	id: string;
	label: string;
	value?: string;
	helper?: string;
	sx?: object;
	errors?: string[];
}

const FormTextInput = ({id, label, value, helper, sx, errors}: FormTextInputProps) => {
	const dispatch = useAppDispatch();
	return <Box sx={sx}>
			<FormLabel>{label}</FormLabel>
			<Input value={value ?? ""} onChange={(e) => dispatch(setField({field: id, value: e.currentTarget.value}))} />
			<FormHelperText
				sx={{ color: (errors ?? []).length ? 'red' : '' }}
			>
				{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
			</FormHelperText>
	</Box>
}

export default FormTextInput