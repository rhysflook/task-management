import { useParams } from "react-router-dom";
import { useGetRingGroupQuery } from "../../services/ringGroup";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const RingGroupDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No ringGroup ID provided.</div>;
	}
	const {isLoading} = useGetRingGroupQuery(id);
	const ringGroup = useSelector((state) => state.ringGroups.ringGroup);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{ringGroup.name}</Typography>
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

export default RingGroupDashboard;