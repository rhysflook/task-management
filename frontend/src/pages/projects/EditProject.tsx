import { Box } from "@mui/joy"
import Form from "../../features/forms/Form"
import { useAppSelector } from "../../stores/hooks"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetRecordQuery } from "../../services/form"
import { useParams } from "react-router-dom"

const EditProject = () => {
	const { id } = useParams<{ id: string }>();
	const {isLoading} = useGetRecordQuery(`projects/${id}/edit?relationships=users,tags`);

	const { fields } = useAppSelector((state) => {
		if (!state.projects.form) {
			return {
				fields: {}
			};
		}
		return state.projects.form
	})
	console.log(fields);
	return <Box sx={{ margin: "2rem" }}>
		<Form feature="projects" mode={"edit"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field))}
			</>}

		</Form>
	</Box>
}

export default EditProject