import { useParams } from "react-router-dom";
import { useGetExtensionQuery } from "../../services/extension";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const ExtensionDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No extension ID provided.</div>;
	}
	const {isLoading} = useGetExtensionQuery(id);
	const extension = useSelector((state) => state.extensions.extension);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{extension.name}</Typography>
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

export default ExtensionDashboard;