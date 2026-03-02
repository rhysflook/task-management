import { useParams } from "react-router-dom";
import { useGetStaffQuery } from "../../services/staff";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const StaffDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No staff ID provided.</div>;
	}
	const {isLoading} = useGetStaffQuery(id);
	const staff = useSelector((state) => state.staff.staff);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{staff.name}</Typography>
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

export default StaffDashboard;