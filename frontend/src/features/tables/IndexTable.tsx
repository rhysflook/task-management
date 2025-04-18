import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import { TableColumn, TableRow } from '../../types/tables/table';
import Row from '../../features/tables/Row';
import { useAppSelector } from '../../stores/hooks'
import { sliceKey } from '../../stores/store';
import { useGetRecordsQuery } from '../../services/tables';
import Navigation from './Navigation';

interface TableProps {
	slice: sliceKey;
	containerStyles?: React.CSSProperties;
}

const IndexTable: React.FC<TableProps> = ({ slice, containerStyles }) => {
	let {columns, queryString, records} = useAppSelector((state) => state[slice]);

	const { isLoading } = useGetRecordsQuery(queryString, {
		refetchOnMountOrArgChange: true,
	  });

	const headers = columns.map((column) => column.label);

	return <Sheet sx={containerStyles}>
			<Table
				color="neutral"
				size="md"
				borderAxis="both"
				stripe="even"
				variant="outlined"
			>
				{/* Table Header */}
				<thead>
					<tr>{columns.map(
							(column: TableColumn, index: number) =>
								<th
									key={index}
									style={{
										width: column.width,
										textAlign: column.align,
									}}
								>
									{column.label}
								</th>
						)}
					</tr>
				</thead>
				<tbody>
					{
						isLoading  ?
						<tr><td colSpan={3}>Loading...</td></tr> :
						records.map((row: TableRow, index: number) => (<Row key={index} row={row} columns={columns}/>))}
				</tbody>
			</Table>
			<Navigation position={"center"} slice={slice}/>
		</Sheet>
}

export default IndexTable;