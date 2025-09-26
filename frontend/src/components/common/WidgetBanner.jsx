import { Box } from "@mui/joy";
import DataWidget from "./DataWidget";

const WidgetBanner = ({
	widgets,
	width,
	maxBannerPerRow = 5,
	equalizeRows = false,
	gap = 6,
	alignment = "start"
}) => {

	const percentageGap = gap / maxBannerPerRow;
	const paddingDiff = (maxBannerPerRow * 2) / maxBannerPerRow;
	const widgetWidth = `${100 / maxBannerPerRow - percentageGap - paddingDiff}%`;

	const getPhantomWidgets = () => {
		const missingWidgets = widgets.length % maxBannerPerRow;
		const phantomWidgets = [];
		for (let i = 0; i < missingWidgets; i++) {
			phantomWidgets.push(<Box key={i} sx={{ width: widgetWidth, padding: "1%" }} />);
		}
		return phantomWidgets;
	};

	return (
		<Box sx={{
			width: width ?? "100%",
			display: "flex",
			flexWrap: "wrap",
			gap: `${percentageGap}%`,
			justifyContent: alignment,
		}}>
			{widgets.map((widget, index) => (
				<DataWidget key={index} width={widgetWidth} {...widget} />
			))}
			{equalizeRows && widgets.length > 0 ? getPhantomWidgets() : null}
		</Box>
	);
};

export default WidgetBanner;
