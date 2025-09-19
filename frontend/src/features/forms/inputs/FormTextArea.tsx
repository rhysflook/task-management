import { Box, FormControl, FormHelperText, FormLabel, Textarea } from "@mui/joy"
import { setField } from "../../../stores/reducers/projectSlice";
import { useAppDispatch } from "../../../stores/hooks";

interface FormTextAreaProps {
	id: string;
	label: string;
	helper?: string;
	sx?: object;
	errors?: string[];
	value?: string;
}

const FormTextArea = ({id, label, helper, sx, errors, value}: FormTextAreaProps) => {
	const dispatch = useAppDispatch();
	return <Box sx={sx}>
			<FormControl>
				<FormLabel>{label}</FormLabel>
				<Textarea value={value ?? ""} minRows={3} maxRows={6} onChange={(e) => dispatch(setField({field: id, value: e.currentTarget.value}))}/>
				<FormHelperText
					sx={{ color: (errors ?? []).length ? 'red' : '' }}
				>
					{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
				</FormHelperText>
			</FormControl>
		</Box>
}

export default FormTextArea