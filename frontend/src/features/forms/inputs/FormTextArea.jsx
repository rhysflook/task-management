import { Box, FormControl, FormHelperText, FormLabel, Textarea } from "@mui/joy"
import { useDispatch } from "react-redux";
import { actions } from "../../../stores/store";

const FormTextArea = ({id, feature, label, helper, sx, errors, value}) => {
	const { setField } = actions[feature];
	const dispatch = useDispatch();
	return (
		<Box sx={sx}>
			<FormControl>
				<FormLabel>{label}</FormLabel>
				<Textarea
					value={value ?? ""}
					minRows={3}
					maxRows={6}
					onChange={(e) =>
						dispatch(setField({ field: id, value: e.currentTarget.value }))
					}
				/>
				<FormHelperText sx={{ color: (errors ?? []).length ? 'red' : '' }}>
					{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper}
				</FormHelperText>
			</FormControl>
		</Box>
	)
}

export default FormTextArea
