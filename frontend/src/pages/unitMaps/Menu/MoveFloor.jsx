import { MenuItem } from "@mui/joy";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useDispatch } from "react-redux";
import { moveFloorUp, moveFloorDown } from "../../../stores/reducers/unitMapSlice";

const MoveFloor = () => {
    const dispatch = useDispatch();
    return (
        <>
            <MenuItem onClick={() => dispatch(moveFloorUp())}>
                <ArrowUpwardIcon fontSize="small" />
                階層を上へ
            </MenuItem>
            <MenuItem onClick={() => dispatch(moveFloorDown())}>
                <ArrowDownwardIcon fontSize="small" />
                階層を下へ
            </MenuItem>
        </>
    );
}

export default MoveFloor;