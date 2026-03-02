import { Checkbox, Input, ListItem } from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import { setGridSize, toggleSnapToGrid } from "../../../stores/reducers/unitMapSlice";

const SetSnap = () => {
    const dispatch = useDispatch();
    const { snapToGrid, gridSize } = useSelector((state) => state.unitMaps);
    return (
        <>
        <ListItem>
            グリッドサイズ
            <Input value={gridSize} onChange={(e) => dispatch(setGridSize(e.target.value))} />
        </ListItem>
        <ListItem>
            <Checkbox
                checked={snapToGrid}
                overlay
                label="グリッドにスナップ"
                onChange={(e) => dispatch(toggleSnapToGrid())}
            />
        </ListItem>
        </>
    );
}

export default SetSnap;