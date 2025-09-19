export interface Project {
	id: string;
	name: string;
	description: string;
	code: string;
	tasks: {
		total: number;
		unassigned: number;
		assigned: number;
		active: number;
		completed: number;
		on_hold: number;
		cancelled: number;
		archived: number;
	}
}