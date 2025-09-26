import { Box } from "@mui/joy"
import Form from "../../features/forms/Form"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetFormDataQuery } from "../../services/form"
import { useSelector } from "react-redux";

const CreateExample = () => {

	const {isLoading} = useGetFormDataQuery("examples/formData?");

	const { fields } = useSelector((state) => state.examples.form);

	return <Box sx={{ margin: "2rem" }}>
		<Form feature="examples" mode={"create"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field, "examples"))}
			</>}

		</Form>
	</Box>
}

export default CreateExample