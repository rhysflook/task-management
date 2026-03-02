import { Box } from "@mui/joy";
import { getFieldComponent } from "../../../helpers/formFieldMap";
import { fieldShell } from "../../../helpers/display/fields";

const Fields = ({ fields, feature, filtered = [], mode = 'create' }) => {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                columnGap: 6,
                rowGap: 2,
            }}
        >
            {Object.entries(fields)
                .filter(([key]) => !filtered.includes(key) && (fields[key].scopes ? fields[key].scopes.includes(mode) : true))
                .map(([key, field]) => (
                <Box key={key} sx={fieldShell}>
                    {getFieldComponent(field.type, { ...field, mode, id: field.id || key }, feature)}
                </Box>
            ))}
        </Box>
    );
}   
export default Fields;