import { Box, Typography } from "@mui/joy";

const DataWidget = ({ title, value, width }) => {
	return (
		<Box
			sx={{
				width: width ?? "initial",
				borderRadius: "md",
				boxShadow: "sm",
				display: "flex",
				flexDirection: "column",
				padding: "1%",
			}}>
			<Typography level="h4">
				{title}
			</Typography>
			<Typography
				level="body-lg"
				sx={{
					marginTop: 1,
					color: "primary.main",
				}}
			>
				{value}
			</Typography>
		</Box>
	);
};

export default DataWidget;
