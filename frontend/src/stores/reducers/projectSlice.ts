import { TableConfig } from '../../types/tables/table'
import { applyTableSlice } from './tableReducers'

// Define a type for the slice state


interface ProjectState extends TableConfig {
}

let fields = ['name', 'description', 'code'];
let headers = ['Name', 'Description', 'Code', 'Actions'];
// Define the initial state using that type
const initialState = {headers, fields,}

const projectSlice = applyTableSlice<ProjectState>({
  name: 'projects',
  initialState,
  reducers: {},
});

export const { getPage } = projectSlice.actions;
export default projectSlice.reducer