import { useParams } from "react-router-dom";
import { useGetRoomQuery } from "../../services/room";
import { useSelector } from "react-redux";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const RoomDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No room ID provided.</div>;
	}
	const {isLoading} = useGetRoomQuery(id);
	const room = useSelector((state) => state.rooms.room);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{room.name}</Typography>
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

export default RoomDashboard;