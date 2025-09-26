import CreateAndOpen from "./CreateAndOpen";
import DeleteRecord from "./DeleteRecord";
import EditAndOpen from "./EditAndOpen";

export const actionMap = {
	"createAndOpen": (props) => <CreateAndOpen {...props} />,
	"editAndOpen": (props) => <EditAndOpen {...props} />,
	"delete": (props) => <DeleteRecord {...props} />,
};

export const getAction = (actionType, params) => {
	const actionComponent = actionMap[actionType];
	if (actionComponent) {
		return actionComponent(params);
	} else {
		console.error(`No component found for field type: ${actionType}`);
		return null;
	}
};
