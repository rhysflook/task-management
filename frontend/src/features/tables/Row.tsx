import Button from "@mui/joy/Button";
import { TableRow } from "../../types/tables/table"
import DashboardCustomizeTwoToneIcon from '@mui/icons-material/DashboardCustomizeTwoTone';


interface RowProps {
	row: TableRow;
	fields: string[];
}

const Row: React.FC<RowProps> = ({ row, fields }) => {
return <tr>
		{fields.map((field: string, index: number) => <td key={index}>{row[field]}</td>)}
		<td style={{ minWidth: "200px", textAlign: "center" }}>
			<Button><DashboardCustomizeTwoToneIcon /></Button>
		</td>
	</tr>
}

export default Row;