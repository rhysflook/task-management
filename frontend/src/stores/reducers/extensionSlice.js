import { extensionApi } from '../../services/extension';
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
      helper: "Enter the name of the extension",
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
  name: 'extensions',
  columns,
  actions,
  fields,
}

const extensionSlice = combineSlices({
  name: 'extensions',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      extensionApi.endpoints.getExtension.matchFulfilled,
      (state, action) => {
      state.extension = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = extensionSlice.actions;
export const { selectFormInputs } = extensionSlice.selectors;
export const extensionS = extensionSlice
export default extensionSlice.reducer