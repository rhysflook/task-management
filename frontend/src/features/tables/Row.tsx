import { TableColumn, TableRow } from "../../types/tables/table"
import { actionManager } from "./actionButtons";

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
					{column.render ? actionManager[column.render](row) : row[column.key]}
				</td>)
		}
	</tr>
}

export default Row;