import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import { TableRow } from '../../types/tables/table';
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
	let {headers, queryString, records, fields} = useAppSelector((state) => state[slice]);

	const { isLoading } = useGetRecordsQuery(queryString, {
		refetchOnMountOrArgChange: true,
	  });


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
					<tr>{headers.map((header: string, index: number) => <th key={index}>{header}</th>)}</tr>
				</thead>
				<tbody>
					{
						isLoading  ?
						<tr><td colSpan={3}>Loading...</td></tr> :
						records.map((row: TableRow, index: number) => (<Row key={index} row={row} fields={fields}/>))}
				</tbody>
			</Table>
			<Navigation position={"center"} slice={slice}/>
		</Sheet>
}

export default IndexTable;