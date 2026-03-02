import { Box, Button } from "@mui/joy"
import Form from "../../features/forms/Form"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetFormDataQuery } from "../../services/form"
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const CreateClient = () => {
	const { feature } = useContext(FeatureContext);

	const {isLoading} = useGetFormDataQuery(`${feature}/formData?`);

	const { fields } = useSelector((state) => state.clients.form);

	const navigate = useNavigate();

	return <Box sx={{ margin: "2rem" }}>
		<Button onClick={() => navigate(`/${feature}/list`)}>
			List
		</Button>
		<Form feature={feature} mode={"create"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field))}
			</>}

		</Form>
	</Box>
}

export default CreateClient