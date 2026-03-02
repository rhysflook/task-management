import { useParams } from "react-router-dom";
import { useGetServerQuery } from "../../services/server";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const ServerDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No server ID provided.</div>;
	}
	const {isLoading} = useGetServerQuery(id);
	const server = useSelector((state) => state.server.server);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{server.name}</Typography>
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

export default ServerDashboard;