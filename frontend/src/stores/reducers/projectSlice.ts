import { TableColumn, TableConfig } from '../../types/tables/table'
import { applyTableSlice } from './tableReducers'
import { renderActions } from '../../features/tables/actionButtons';
// Define a type for the slice state


interface ProjectState extends TableConfig {
}
const columns: TableColumn[] = [
  { key: 'name', label: 'Name', overflow: true },
  { key: 'description', label: 'Description', overflow: true },
  { key: 'code', label: 'Code', width: '120px', align: 'center' },
  // { key: 'created_at', label: 'Created', format: 'date' },
  { key: 'actions', notDBVal: true, label: 'Actions', format: 'custom', render: renderActions, align: 'center' }
];
// Define the initial state using that type
const initialState = {columns}

const projectSlice = applyTableSlice<ProjectState>({
  name: 'projects',
  initialState,
  reducers: {},
});

export const { getPage } = projectSlice.actions;
export default projectSlice.reducer