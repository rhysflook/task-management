import { ringGroupApi } from '../../services/ringGroup';
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
      helper: "Enter the name of the ringGroup",
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
  name: 'ringGroups',
  columns,
  actions,
  fields,
}

const ringGroupSlice = combineSlices({
  name: 'ringGroups',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      ringGroupApi.endpoints.getRingGroup.matchFulfilled,
      (state, action) => {
      state.ringGroup = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = ringGroupSlice.actions;
export const { selectFormInputs } = ringGroupSlice.selectors;
export const ringGroupS = ringGroupSlice
export default ringGroupSlice.reducer