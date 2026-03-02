import { useParams } from "react-router-dom";
import { useGetUnitQuery } from "../../services/unit";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const UnitDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No unit ID provided.</div>;
	}
	const {isLoading} = useGetUnitQuery(id);
	const unit = useSelector((state) => state.units.unit);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{unit.name}</Typography>
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

export default UnitDashboard;