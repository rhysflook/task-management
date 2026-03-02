import { useParams } from "react-router-dom";
import { useGetLogQuery } from "../../services/log";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const LogDashboard = () => {
	const { id } = useParams();
	// if (!id) {
	// 	return <div>Error: No log ID provided.</div>;
	// }
	const {isLoading} = useGetLogQuery(id);
	const log = useSelector((state) => state.logs.log);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{log.name}</Typography>
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

export default LogDashboard;