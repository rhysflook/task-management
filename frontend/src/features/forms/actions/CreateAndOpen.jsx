import { Button } from "@mui/joy";
import { useCreateRecordMutation } from "../../../services/form";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { store, slices } from "../../../stores/store";
import { useSelector } from "react-redux";

const CreateAndOpen = ({ feature }) => {
	const [createRecord, result] = useCreateRecordMutation();
	const selector = slices[feature]['selectFormInputs'];

	const data = useSelector((state) =>
		selector ? selector(state) : undefined
	);

	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			navigate(`/${feature}/${result.data.data.id}/edit`);
		}
	}, [result]);
	return (
		<Button
			onClick={() => {
				if (slices[feature]) {
					createRecord({ url: feature, data });
				}
			}}
			sx={{ marginTop: "2rem" }}
		>
			Create and Open
		</Button>
	);
};

export default CreateAndOpen;
