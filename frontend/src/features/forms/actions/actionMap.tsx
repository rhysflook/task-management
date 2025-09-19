import { sliceKey } from "../../../stores/store";
import CreateAndOpen from "./CreateAndOpen";
import DeleteRecord from "./DeleteRecord";
import EditAndOpen from "./EditAndOpen";

interface ActionProps {
	feature: sliceKey;
}

export const actionMap: Record<string, React.FC<ActionProps>> = {
	"createAndOpen": ( props ) => <CreateAndOpen  {...props} />,
	"editAndOpen": ( props ) => <EditAndOpen  {...props} />,
	"delete": ( props ) => <DeleteRecord {...props} />,
};

export const getAction = (actionType: keyof typeof actionMap, params: ActionProps) => {
	const actionComponent = actionMap[actionType];
	if (actionComponent) {
		return actionComponent(params);
	} else {
		console.error(`No component found for field type: ${actionType}`);
		return null;
	}
};
