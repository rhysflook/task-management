export interface TableConfig {
	name: string,
	headers: string[],
	fields: string[],
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
	id: number;
  	value: string;
  	minWidth?: number;
  	align?: 'right' | 'left' | 'center';
  	format?: (value: number) => string;
}