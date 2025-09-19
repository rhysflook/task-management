import Button from "@mui/joy/Button";
import DashboardCustomizeTwoToneIcon from '@mui/icons-material/DashboardCustomizeTwoTone';
import { DashboardNavAction } from "../../../types/actions/actions";
import { useNavigate } from "react-router";

const ToDashboardButton = (payload: DashboardNavAction) => {
	let navigate = useNavigate();
	return <Button onClick={() => navigate(`projects/${payload.id}`)}><DashboardCustomizeTwoToneIcon /></Button>;
}
export default ToDashboardButton;