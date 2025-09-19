import { Box } from "@mui/joy"
import { useAppSelector } from "../../../stores/hooks";
import { sliceKey } from "../../../stores/store";
import { getAction } from "./actionMap";
import React, { ReactNode } from "react";

interface ActionsProps {
	feature: sliceKey;
	mode: "edit" | "create";
}

const Actions = ({feature, mode}: ActionsProps) => {
	const actions = useAppSelector((state) => {
		if (!state[feature].form?.actions) {
			const actions = {
				create: [],
				edit: []
			};
			return actions[mode];
		}
		return state[feature].form.actions[mode];
	});
	console.log(actions, mode);
	return (
		<Box sx={{ gap: "1rem", display: "flex",}}>
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