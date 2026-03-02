import { Box, Button, Tooltip } from "@mui/joy"
import BuildIcon from "@mui/icons-material/Build";
import MoveUpIcon from "@mui/icons-material/MoveUp";
import { useDispatch, useSelector } from "react-redux";
import { setMode } from "../../stores/reducers/unitMapSlice";
import { useSaveUnitMapMutation } from "../../services/unitMap";
import { inTypes, UserType } from "../../stores/reducers/authSlice";

const ModeToggles = () => {
    const { floors, mode } = useSelector(state => state.unitMaps);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [saveUnitMap] = useSaveUnitMapMutation();

    const handleBuildOnClick = () => {
        dispatch(setMode(mode === "build" ? "action" : "build"));
        saveUnitMap({ floors })
    }

    const handleMoveOnClick= () => {
        dispatch(setMode(mode === "move" ? "action" : "move"))
        saveUnitMap({ floors })
    }

    return (
         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {inTypes(user, [UserType.ADMIN, UserType.SUPERUSER]) &&
                <Tooltip title="配置やサイズ編集">
                
                <Button
                    size="sm"
                    variant={mode === "build" ? "solid" : "outlined"}
                    startDecorator={<BuildIcon />}
                    onClick={handleBuildOnClick}
                >
                    ビルド
                </Button>
                </Tooltip>
            }
            <Tooltip title="入所者の移動">
            <Button
                size="sm"
                variant={mode === "move" ? "solid" : "outlined"}
                startDecorator={<MoveUpIcon />}
                onClick={handleMoveOnClick}
            >
                移動
            </Button>
            </Tooltip>
        </Box>
    )
}

export default ModeToggles