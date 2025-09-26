import { Button } from "@mui/joy";
import { useDeleteRecordMutation } from "../../../services/form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const DeleteRecord = ({ feature }) => {
	const { id } = useParams();
	const [deleteRecord, result] = useDeleteRecordMutation();

	const { fields } = useSelector((state) => {
		if (!state[feature].form) {
			return {
				fields: {}
			};
		}
		return state[feature].form
	});
	const relationships = Object.values(fields).reduce((acc, field) => {
		if (field.relationship) {
			acc[field.relationship.split('/')[1]] = field.value.map((item) => item.id);
		}
		return acc;
	}, {});

	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			navigate(`/${feature}`);
		}
	}, [result]);

	return (
		<Button
			onClick={() =>
				deleteRecord({
					url: `${feature}/${id}`,
					data: {
						relationships
					}
				})
			}
			sx={{ marginTop: "2rem", backgroundColor: "#ff2355" }}
		>
			Delete
		</Button>
	);
};

export default DeleteRecord;
