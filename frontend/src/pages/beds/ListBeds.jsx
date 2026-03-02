import { Box, Button } from "@mui/joy";
import IndexTable from "../../features/tables/IndexTable";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearForm } from "../../stores/reducers/bedSlice";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const ListBed = () => {

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { feature } = useContext(FeatureContext);

	function handleClick() {
		dispatch(clearForm());
		navigate(`/${feature}/create`);
	}

	return (
		<>
			<Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
				<Button onClick={handleClick} sx={{ margin: "2rem 2rem 0" }}>新規登録<AddIcon/></Button>
			</Box>
			<IndexTable containerStyles={{ width: "calc(100% - 4rem)", margin: "2rem" }}/>
		</>
	);
}

export default ListBed;