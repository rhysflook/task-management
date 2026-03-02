import { Button, Input, ListItem } from "@mui/joy";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../../stores/reducers/unitMapSlice";

const AddRoom = () => {
    const [roomName, setRoomName] = useState("");
    const { currentFloor } = useSelector(state => state.unitMaps);
    const dispatch = useDispatch();
    return (
        <ListItem>
            <Input
                size="sm"
                placeholder="新しい居室名"
                sx={{ width: 160 }}
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
            />
            <CropSquareIcon fontSize="small" />
            <Button
            disabled={!roomName.trim()}
            onClick={() => dispatch(addItem({
                floor: currentFloor,
                item: { type: "room", name: roomName, x: 60, y: 40, width: 140, height: 100, beds: [], gridRows: 1, gridCols: 1 },
            }))}>
            居室を追加
            </Button>
        </ListItem>
    );
}

export default AddRoom;
