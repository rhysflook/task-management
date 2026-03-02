import { useParams } from "react-router-dom";
import { useGetClientQuery } from "../../services/client";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const ClientDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No client ID provided.</div>;
	}
	const {isLoading} = useGetClientQuery(id);
	const client = useSelector((state) => state.clients.client);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{client.name}</Typography>
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

export default ClientDashboard;