
import { ActionManager, DashboardNavAction } from "../../types/actions/actions";
import ToDashboardButton from "./actions/ToDashboardButton";

export const actionManager: ActionManager = {
	"renderActions": (payload: DashboardNavAction) => <ToDashboardButton {...payload} />,
};