import { Box } from "@mui/joy"
import Form from "../../features/forms/Form"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetRecordQuery } from "../../services/form"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux";

const EditExample = () => {
	const { id } = useParams();
	const {isLoading} = useGetRecordQuery(`examples/${id}/edit?`);

	const { fields } = useSelector((state) => state.examples.form);
	console.log(fields);
	return <Box sx={{ margin: "2rem" }}>
		<Form feature="examples" mode={"edit"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field, "examples"))}
			</>}

		</Form>
	</Box>
}

export default EditExample