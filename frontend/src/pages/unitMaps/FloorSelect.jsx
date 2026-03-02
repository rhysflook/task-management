import { Box, Option, Select, Typography } from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import { selectFloor } from "../../stores/reducers/unitMapSlice";

const FloorSelect = () => {
    const { floors, currentFloor } = useSelector(state => state.unitMaps);
    const dispatch = useDispatch();
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography level="body-sm" sx={{ color: "text.secondary" }}>
            ユニット
            </Typography>
            <Select
                size="sm"
                value={currentFloor}
                onChange={(_, val) => dispatch(selectFloor({ id: val }))}
                sx={{ minWidth: 180 }}
            >
            {floors.map((f) => (
                <Option key={f.id} value={f.id}>
                {f.name}
                </Option>
            ))}
            </Select>
        </Box>
    );
}

export default FloorSelect;