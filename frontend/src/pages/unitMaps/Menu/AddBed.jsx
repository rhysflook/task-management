import { Button, Input, ListItem } from "@mui/joy";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { addItem } from "../../../stores/reducers/unitMapSlice";

const AddBed = () => {
    const [bedName, setBedName] = useState("");
    const { currentFloor } = useSelector(state => state.unitMaps);
    const dispatch = useDispatch();
    return (
         <ListItem>
            <Input
                size="sm"
                placeholder="新しいベッド名"
                sx={{ width: 160 }}
                value={bedName}
                onChange={(e) => setBedName(e.target.value)}
            />
            <MeetingRoomIcon fontSize="small" />
            <Button
                disabled={!bedName.trim()}
                onClick={() => dispatch(addItem({
                floor: currentFloor,
                item: { type: "bed", name: bedName, x: 60, y: 40, w: 140, h: 100 },
            }))}
            >
            ベッドを追加
            </Button>
        </ListItem >
    );
}

export default AddBed;