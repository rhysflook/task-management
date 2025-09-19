import { Box, Typography } from "@mui/joy";

export interface DataWidgetProps {
	  title: string;
	  value: string | number;
	  width?: string;
}

const DataWidget = ({ title, value, width }: DataWidgetProps) => {
  return (
	<Box
		sx={{
			width: width ?? "initial",
			borderRadius: "md",
			boxShadow: "sm",
			display: "flex",
			flexDirection: "column",
			padding: "1%",
			// flexGrow: 1
		}}>
		<Typography
			level="h4"
		>
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