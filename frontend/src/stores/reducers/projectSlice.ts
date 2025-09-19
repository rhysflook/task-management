import { projectApi } from '../../services/project';
import { FeatureConfig } from '../../types/features/features';
import { FormField } from '../../types/forms/forms';
import { Project } from '../../types/projects/project';
import { TableColumn } from '../../types/tables/table'
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


interface ProjectState extends FeatureConfig {
  project: Project,
}
const columns: TableColumn[] = [
  { key: 'name', label: 'Name', overflow: true },
  { key: 'description', label: 'Description', overflow: true },
  { key: 'code', label: 'Code', width: '120px', align: 'center' },
  { key: 'actions', notDBVal: true, label: 'Open Dashboard', format: 'custom', render: 'renderActions', align: 'center' }
];

const fields: {[key: string]: FormField} = {
  'name': {
    label: "Name",
    id: "name",
    type: "text",
    value: "",
    helper: "Enter the name of the project",
    required: true,
    sx: {width: "20%", marginTop: "2rem"}
   },
  'code': {
    label: "Code",
    id: "code",
    type: "text",
    value: "",
    helper: "Enter the code of the project",
    required: true,
    sx: {width: "20%", marginTop: "2rem"}
   },
  'description': {
    label: "Description",
    id: "description",
    type: "textarea",
    value: "",
    helper: "Enter the description of the project",
    required: true,
    sx: {width: "20%", marginTop: "2rem"}
   },
  'users': {
    label: "Users",
    id: "users",
    type: "select",
    value: [],
    helper: "Select users to assign to the project",
    required: true,
    sx: {width: "50%", marginTop: "2rem"},
    options: [],
    relationship: "projects/users/options"
  },
  'tags': {
    label: "Tags",
    id: "tags",
    type: "select",
    value: [],
    helper: "Select tags to assign to the project",
    required: true,
    sx: {width: "50%", marginTop: "2rem"},
    options: [],
    relationship: "projects/tags/options"
  },
}
// Define the initial state using that type
const initialState: ProjectState = {
  project: {
    id: '',
    name: '',
    description: '',
    code: '',
    tasks: {
      total: 0,
      unassigned: 0,
      assigned: 0,
      active: 0,
      completed: 0,
      on_hold: 0,
      cancelled: 0,
      archived: 0,
    },
  },
  // ...getFeatureInitialState(['table']),
  name: 'projects',
  columns,
  fields,
}

const projectSlice = combineSlices<ProjectState>({
  name: 'projects',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      projectApi.endpoints.getProject.matchFulfilled,
      (state, action) => {
      state.project = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = projectSlice.actions;
export const { selectFormInputs } = projectSlice.selectors;

export default projectSlice.reducer