import { Button } from "@mui/joy";
import { useEditRecordMutation } from "../../../services/form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { slices, store } from "../../../stores/store";
import { useSelector } from "react-redux";

const EditAndOpen = ({ feature }) => {

	const { id } = useParams();
	const [editRecord, result] = useEditRecordMutation();

	const selector = slices[feature]['selectFormInputs'];
	
		const data = useSelector((state) =>
			selector ? selector(state) : undefined
		);
	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			navigate(`/${feature}/${id}`);
		}
	}, [result]);
	return (
		<Button
			onClick={() => {
				editRecord({ url: `${feature}/${id}`, data });
			}}
			sx={{ marginTop: "2rem" }}
		>
			Edit and Open
		</Button>
	);
};

export default EditAndOpen;