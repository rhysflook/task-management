import { Box } from "@mui/joy"
import Form from "../../features/forms/Form"
import { useAppSelector } from "../../stores/hooks"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetFormDataQuery } from "../../services/form"

const CreateProject = () => {

	const {isLoading} = useGetFormDataQuery("projects/formData?relationships=users,tags");

	const { fields } = useAppSelector((state) => {
		if (!state.projects.form) {
			return {
				fields: {}
			};
		}
		return state.projects.form
	})
	return <Box sx={{ margin: "2rem" }}>
		<Form feature="projects" mode={"create"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field))}
			</>}

		</Form>
	</Box>
}

export default CreateProject