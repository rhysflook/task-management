import { Button } from "@mui/joy";
import { useCreateRecordMutation } from "../../../services/form";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { selectFormInputs } from "../../../stores/reducers/projectSlice";
import { store } from "../../../stores/store";

interface CreateAndOpenProps {
	feature: string;
}

const CreateAndOpen = ({feature}: CreateAndOpenProps) => {
	const [createRecord, result] = useCreateRecordMutation();
	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			navigate(`/${feature}/${result.data.data.id}`);
		}
	}, [result]);
	return 	<Button
				onClick={() => {createRecord({url: feature, data: selectFormInputs(store.getState())})}}
				sx={{ marginTop: "2rem" }}
			>
				Create and Open
			</Button>
}

export default CreateAndOpen;