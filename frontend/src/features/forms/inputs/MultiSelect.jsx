import { Autocomplete, Box, FormControl, FormHelperText, FormLabel } from "@mui/joy";
import { useDispatch } from "react-redux";
import { actions } from "../../../stores/store";

const MultiSelect = ({ feature, options, label, helper, sx, groups, value, id, errors }) => {
	const dispatch = useDispatch();
	const { setField } = actions[feature];
	const allOptions = [...options, ...(groups || [])];
	return (
		<Box sx={sx}>
			<FormControl>
				<FormLabel>{label}</FormLabel>
				<Autocomplete
					multiple
					options={allOptions}
					value={value ?? []}
					getOptionLabel={(option) => option.name}
					onChange={(_, newValue) => dispatch(setField({ field: id, value: newValue }))}
				/>
				<FormHelperText
					sx={{ color: (errors ?? []).length ? 'red' : '' }}
				>
					{(errors ?? []).length > 0 ? (errors ?? []).join(", ") : helper + " (Use Ctrl+click to select multiple)"}
				</FormHelperText>
			</FormControl>
		</Box>
	);
};

export default MultiSelect;
