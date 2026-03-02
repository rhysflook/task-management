import { Box, Button } from "@mui/joy";
import IndexTable from "../../features/tables/IndexTable";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const ListServer = () => {

	const navigate = useNavigate();
	const { feature } = useContext(FeatureContext);

	function handleClick() {
		navigate(`/${feature}/create`);
	}

	return (
		<>
			<Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
				{/* <Button onClick={handleClick} sx={{ margin: "2rem 2rem 0" }}>Add Server<AddIcon/></Button> */}
			</Box>
			<IndexTable containerStyles={{ width: "calc(100% - 4rem)", margin: "2rem" }}/>
		</>
	);
}

export default ListServer;