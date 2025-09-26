import Button from "@mui/joy/Button";
import DashboardCustomizeTwoToneIcon from '@mui/icons-material/DashboardCustomizeTwoTone';
import { useNavigate } from "react-router";

const ToDashboardButton = (props) => {
	let navigate = useNavigate();
	return (
		<Button onClick={() => navigate(`projects/${props.id}`)}>
			<DashboardCustomizeTwoToneIcon />
		</Button>
	);
};

export default ToDashboardButton;