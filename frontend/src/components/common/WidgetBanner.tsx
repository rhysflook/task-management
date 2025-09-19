import { Box } from "@mui/joy";
import DataWidget, { DataWidgetProps } from "./DataWidget";

interface WidgetBannerProps {
	widgets: DataWidgetProps[];
	width?: string;
	maxBannerPerRow?: number;
	equalizeRows?: boolean;
	gap?: number;
	alignment?: string;
}

const WidgetBanner = ({ widgets, width, maxBannerPerRow=5, equalizeRows=false, gap=6, alignment="start"}: WidgetBannerProps) => {

	const percentageGap = gap / maxBannerPerRow;
	const paddingDiff = (maxBannerPerRow * 2) / maxBannerPerRow
	const widgetWidth = `${100 / maxBannerPerRow - percentageGap - paddingDiff}%`;

	console.log(equalizeRows, widgets.length);

	const getPhantomWidgets = () => {
		const missingWidgets = widgets.length % maxBannerPerRow;
		const phantomWidgets = [];
		for (let i = 0; i < missingWidgets; i++) {
			phantomWidgets.push(<Box key={i} sx={{ width: widgetWidth, padding: "1%" }} />);
		}
		console.log("phantomWidgets", phantomWidgets);
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