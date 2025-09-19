import { Button } from "@mui/joy";
import { useEditRecordMutation } from "../../../services/form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { selectFormInputs } from "../../../stores/reducers/projectSlice";
import { store } from "../../../stores/store";

interface EditAndOpenProps {
	feature: string;
}

const EditAndOpen = ({feature}: EditAndOpenProps) => {
	const { id } = useParams<{ id: string }>();
	const [editRecord, result] = useEditRecordMutation();
	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			navigate(`/${feature}/${id}`);
		}
	}, [result]);
	return 	<Button
				onClick={() => {editRecord({url: `${feature}/${id}`, data: selectFormInputs(store.getState())})}}
				sx={{ marginTop: "2rem" }}
			>
				Edit and Open
			</Button>
}

export default EditAndOpen;