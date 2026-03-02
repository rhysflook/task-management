import { Box, Button, Typography } from "@mui/joy";
import IndexTable from "../../features/tables/IndexTable";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const ListLog = () => {

	const navigate = useNavigate();
	const { feature } = useContext(FeatureContext);

	function handleClick() {
		navigate(`/${feature}/create`);
	}
	return (
		<>
			

			<Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems  : "center", marginTop: "0.5rem", padding: "0 2rem"}}>
				<Typography level="h1" fontWeight={700}>
					通知ログ照会
				</Typography>
				{/* <Button onClick={handleClick} sx={{ margin: "2rem 2rem 0" }}>Add Log<AddIcon/></Button> */}
			</Box>
			<IndexTable containerStyles={{ width: "calc(100% - 4rem)", margin: "1rem 2rem", padding: "2rem" }}

				tableOverwrites ={{
					maxHeight: "52vh",
				}}
			/>
		</>
	);
}

export default ListLog;