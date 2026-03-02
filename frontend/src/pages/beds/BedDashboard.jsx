import { useParams } from "react-router-dom";
import { useGetBedQuery } from "../../services/bed";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const BedDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No bed ID provided.</div>;
	}
	const {isLoading} = useGetBedQuery(id);
	const bed = useSelector((state) => state.beds.bed);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{bed.name}</Typography>
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

export default BedDashboard;