export interface TableConfig {
	name: string,
	columns: TableColumn[],
	queryString: string,
	records : TableRow[],
	links: {
		self: string,
		next: string,
		prev: string,
	},
	meta: {
		total: number,
		current_page: number,
		last_page: number,
		per_page: number,
	}
}

export interface TableRow {
	[key: string]: string | number | boolean;
}

export interface TableColumn {
	key: string;             // the DB field name
	label: string;          // label to show in the table header
	width?: number | string; // optional column width
	format?: 'text' | 'date' | 'currency' | 'boolean' | 'custom';
	overflow?: boolean;      // true = ellipsis, false = wrap
	align?: 'left' | 'center' | 'right';
	notDBVal?: boolean;
	render?: (column: number) => JSX.Element; // for custom rendering
}