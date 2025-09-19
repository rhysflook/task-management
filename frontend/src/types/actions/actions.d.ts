interface ActionParamsBase {
	id: string;
  }

type ActionRenderer<P extends ActionParamsBase = ActionParamsBase> = (payload: P) => JSX.Element;

export interface ActionManager {
	[key: string]: ActionRenderer;
}

export interface DashboardNavAction extends ActionParamsBase {}

