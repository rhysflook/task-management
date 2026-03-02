import { useParams } from "react-router-dom";
import { useGetPatientQuery } from "../../services/patient";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const PatientDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No patient ID provided.</div>;
	}
	const {isLoading} = useGetPatientQuery(id);
	const patient = useSelector((state) => state.patients.patient);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{patient.name}</Typography>
	  	<WidgetBanner widgets={
			[
	
			]
		}
		width={"100%"}
		maxBannerPerRow={5}
		gap={8}
		alignment="center"
	  />
	</div>
  );
}

export default PatientDashboard;