import Create from "./Create";
import CreateAndOpen from "./CreateAndOpen";
import DeleteRecord from "./DeleteRecord";
import EditAndOpen from "./EditAndOpen";
import List from "./List";
import CreateWithSubFeature from "./CreateWithSubFeature";
import EditWithSubFeature from "./EditWithSubFeature";

export const actionMap = {
	"createAndOpen": (props) => <CreateAndOpen {...props} />,
	"create": (props) => <Create {...props} />,
	"editAndOpen": (props) => <EditAndOpen {...props} />,
	"delete": (props) => <DeleteRecord {...props} />,
	"list": (props) => <List {...props} />, // Placeholder, replace with actual List component when available
	"createWithSubFeature": (props) => <CreateWithSubFeature {...props} />,
	"editWithSubFeature": (props) => <EditWithSubFeature {...props} />,
};

export const getAction = (actionType, params) => {
	const actionComponent = actionMap[actionType];
	if (actionComponent) {
		return actionComponent(params);
	} else {
		return null;
	}
};
