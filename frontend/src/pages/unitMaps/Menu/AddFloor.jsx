import { ListItem } from "@mui/joy";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button, Input } from "@mui/joy";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addFloor } from "../../../stores/reducers/unitMapSlice";


const AddFloor = () => {
    const [floorName, setFloorName] = useState("");
    const dispatch = useDispatch();

    return (
        <ListItem>
            <AddCircleOutlineIcon fontSize="small" />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Input
                size="sm"
                placeholder="新しい階層名"
                sx={{ width: 160 }}
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
            />
            <Button
                size="sm"
                onClick={() => {
                if (!floorName.trim()) return;
                dispatch(addFloor({ name: floorName.trim() }));
                setFloorName("");
                }}
            >
                追加
            </Button>
            </Box>
        </ListItem>
    );
}

export default AddFloor;