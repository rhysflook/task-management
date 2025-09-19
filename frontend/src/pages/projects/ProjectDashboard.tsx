import { useParams } from "react-router-dom";
import { useGetProjectQuery } from "../../services/project";
import { useAppSelector } from "../../stores/hooks";
import WidgetBanner from "../../components/common/WidgetBanner";
import { Typography } from "@mui/joy";

const ProjectDashboard = () => {
	const { id } = useParams();
	if (!id) {
		return <div>Error: No project ID provided.</div>;
	}
	const {isLoading} = useGetProjectQuery(id);
	const project = useAppSelector((state) => state.projects.project);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const taskCompletePercentage = project.tasks.completed / (project.tasks.unassigned + project.tasks.assigned + project.tasks.active) * 100;

	console.log(project);
	return (
	<div>
		<Typography level="h1" sx={{ margin: "2rem" }}>{project.name}</Typography>
	  	<WidgetBanner widgets={
			[
				{title: "Tasks Remaining", value: project.tasks.unassigned + project.tasks.assigned + project.tasks.active},
				{title: "Tasks Complete", value: project.tasks.completed},
				{title: "Percentage Complete", value: `${isNaN(taskCompletePercentage) ? 0 : taskCompletePercentage}%`},
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

export default ProjectDashboard;