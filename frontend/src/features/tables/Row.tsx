import { TableColumn, TableRow } from "../../types/tables/table"

interface RowProps {
	row: TableRow;
	columns: TableColumn[];
}

const Row: React.FC<RowProps> = ({ row, columns }) => {
return <tr>
		{
			columns.map((column: TableColumn, index: number) =>
				<td
					key={index}
					style={{
						width: column.width,
						textAlign: column.align,
						overflow: column.overflow ? 'hidden' : 'visible',
						textOverflow: column.overflow ? 'ellipsis' : 'clip',
						whiteSpace: column.overflow ? 'nowrap' : 'normal'
					}}
				>
					{column.render ? column.render(row['id'] as number) : row[column.key]}
				</td>)
		}
	</tr>
}

export default Row;