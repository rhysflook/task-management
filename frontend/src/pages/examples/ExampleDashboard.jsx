import { useParams } from "react-router-dom";
import { useGetExampleQuery } from "../../services/example";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const ExampleDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No example ID provided.</div>;
	}
	const {isLoading} = useGetExampleQuery(id);
	const example = useSelector((state) => state.examples.example);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{example.name}</Typography>
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

export default ExampleDashboard;