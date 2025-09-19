import { Autocomplete, Box, FormControl, FormHelperText, FormLabel } from "@mui/joy";
import { useAppDispatch } from "../../../stores/hooks";
import { setField } from "../../../stores/reducers/projectSlice";

interface MultiSelectProps {
	id?: string;
	options: { name: string; value: string }[];
	label: string;
	value?: { name: string; value: string }[];
	helper?: string;
	sx?: object;
	groups?: { name: string; value: string }[];
	relationship?: string;
	errors?: string[];
}

const MultiSelect = ({ options, label, helper, sx, groups, value, id, errors }: MultiSelectProps) => {

	const dispatch = useAppDispatch();

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