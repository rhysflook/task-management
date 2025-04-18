import { TableColumn } from "../types/tables/table";

export const selectFields = (columns: TableColumn[]) => {
	return columns
		.filter((column) => !column.notDBVal)
		.map((column) => column.key);
}
