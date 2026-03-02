import { Box, Button } from "@mui/joy"
import Form from "../../features/forms/Form"
import { getFieldComponent } from "../../helpers/formFieldMap"
import { useGetRecordQuery } from "../../services/form"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector } from "react-redux";
import { useContext } from "react"
import { FeatureContext } from "../../context/FeatureContext"

const EditUnitMap = () => {
	const { id } = useParams();
	const { feature } = useContext(FeatureContext);

	const {isLoading} = useGetRecordQuery(`${feature}/${id}/edit?`);

	const { fields } = useSelector((state) => state.unitMaps.form);
	const navigate = useNavigate();

	return <Box sx={{ margin: "2rem" }}>
		<Button onClick={() => navigate(`/${feature}/list`)}>
			List
		</Button>
		<Form feature={feature} mode={"edit"}>
			{!isLoading && <>
				{Object.values(fields).map((field) => getFieldComponent(field.type, field))}
			</>}

		</Form>
	</Box>
}

export default EditUnitMap