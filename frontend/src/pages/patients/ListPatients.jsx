import { Box, Button, Typography } from "@mui/joy";
import IndexTable from "../../features/tables/IndexTable";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearForm } from "../../stores/reducers/patientSlice";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const ListPatient = () => {

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { feature } = useContext(FeatureContext);

	function handleClick() {
		dispatch(clearForm());
		navigate(`/${feature}/create`)
	}

	return (
		<>
			<Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems  : "center", marginTop: "0.5rem", padding: "0 2rem" }}>
				<Typography level="h1" fontWeight={700}>
				入所者一覧
				</Typography>
				<Button onClick={handleClick} sx={{ margin: "0.5rem 0 0 0" }}>新規登録<AddIcon/></Button>
			</Box>
			<IndexTable
			slice={"patients"}
			containerStyles={{ width: "calc(100% - 4rem)", margin: "1rem 2rem", padding: "2rem" }}/>
		</>
	);
}

export default ListPatient;