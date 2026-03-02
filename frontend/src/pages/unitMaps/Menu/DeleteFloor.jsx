import { useDispatch, useSelector } from "react-redux";
import { MenuItem } from "@mui/joy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { deleteFloor } from "../../../stores/reducers/unitMapSlice";

const DeleteFloor = () => {
    const dispatch = useDispatch();
    const currentFloor = useSelector((state) => state.unitMaps.currentFloor);

    return (
        <MenuItem color="danger" onClick={() => dispatch(deleteFloor({ id: currentFloor }))}>
            <DeleteOutlineIcon fontSize="small" />
            現在の階層を削除
        </MenuItem>
    );
}

export default DeleteFloor;