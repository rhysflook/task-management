import { Box } from "@mui/joy"
import { getAction } from "./actionMap";
import React from "react";
import { useSelector } from "react-redux";

const Actions = ({ feature, mode }) => {
	const actions = useSelector((state) => state[feature].form.actions[mode]);
	console.log(actions, mode);
	return (
		<Box sx={{ gap: "1rem", display: "flex" }}>
			{actions && Object.values(actions).map((action, index) => {
				const resolvedAction = getAction(action, { feature });
				return (
					<React.Fragment key={index}>
						{React.isValidElement(resolvedAction) ? resolvedAction : null}
					</React.Fragment>
				);
			})}
		</Box>
	);
}

export default Actions
