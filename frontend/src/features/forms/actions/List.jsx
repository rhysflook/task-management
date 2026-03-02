import { Button } from "@mui/joy";
import { useNavigate, } from "react-router-dom";

const List = ({ feature }) => {
	const navigate = useNavigate();

	return (
		<Button
            onClick={() => navigate(`/${feature}/list`)}
            	sx={{ marginTop: "2rem", border: '1px solid', borderColor: 'secondary.500' }}      
            color="secondary"
		>
			一覧へ
		</Button>
	);
};

export default List;
