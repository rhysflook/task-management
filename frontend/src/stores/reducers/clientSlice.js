import { clientApi } from '../../services/client';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'name', label: 'Name', overflow: true },
];

const fields = {
    'name': {
      label: "Name",
      id: "name",
      type: "text",
      value: "",
      helper: "Enter the name of the client",
      required: true,
      sx: {width: "20%", marginTop: "2rem"}
   },
}

const actions = [
  // Add actions here (e.g. 'edit')
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'clients',
  columns,
  actions,
  fields,
}

const clientSlice = combineSlices({
  name: 'clients',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      clientApi.endpoints.getClient.matchFulfilled,
      (state, action) => {
      state.client = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = clientSlice.actions;
export const { selectFormInputs } = clientSlice.selectors;
export const clientS = clientSlice
export default clientSlice.reducer