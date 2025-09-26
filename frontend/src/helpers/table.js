export const selectFields = (columns) => {
	return columns
		.filter((column) => !column.notDBVal)
		.map((column) => column.key);
}
