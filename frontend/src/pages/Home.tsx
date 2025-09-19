import { Box, Button } from "@mui/joy";
import IndexTable from "../features/tables/IndexTable";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";

const Home = () => {

	const navigate = useNavigate();

	function handleClick() {
		navigate("/projects/create");
	}

	return (
		<>
			<Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
				<Button onClick={handleClick} sx={{ margin: "2rem 2rem 0" }}>Add Project<AddIcon/></Button>
			</Box>
			<IndexTable slice={"projects"} containerStyles={{ width: "calc(100% - 4rem)", margin: "2rem" }}/>
		</>
	);
}

export default Home;