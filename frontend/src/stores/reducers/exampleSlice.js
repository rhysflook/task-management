import { exampleApi } from '../../services/example';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'name', label: 'Name', overflow: true, searchable: true },
  { key: 'group', label: 'Group', overflow: true, searchable: true, type: 'select' },
];

const fields = {
    'name': {
      label: "Name",
      id: "name",
      type: "text",
      value: "",
      helper: "Enter the name of the example",
      required: true,
      sx: {width: "20%", marginTop: "2rem"}
   },
   'group': {
      label: "Group",
      id: "group",
      type: "select",
      value: null,
      // optionsEndpoint: exampleApi.endpoints.getGroups,
      options: [{id: 1, name: "Group 1"}, {id: 2, name: "Group 2"}],
      helper: "Select the group for the example",
      required: true,
      sx: {width: "20%", marginTop: "2rem"}
   }
}

const actions = [
  'edit',
  'show',
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'examples',
  columns,
  actions,
  fields,
}

const exampleSlice = combineSlices({
  name: 'examples',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      exampleApi.endpoints.getExample.matchFulfilled,
      (state, action) => {
      state.example = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = exampleSlice.actions;
export const { selectFormInputs } = exampleSlice.selectors;
export const exampleS = exampleSlice
export default exampleSlice.reducer