import { actionManager } from "./actionButtons";

const Row = ({ row, columns }) => {
	return (
		<tr>
			{columns.map((column, index) => (
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
				</td>
			))}
		</tr>
	);
};

export default Row;
