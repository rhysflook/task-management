import { id } from 'date-fns/locale';
import { serverApi } from '../../services/server';
import { tablesApi } from '../../services/tables';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'server', label: 'サーバー', overflow: true, searchable: true },
  { key: 'status', label: 'ステータス', type: 'select', overflow: true, options: [{value:'', label: 'すべて'}, {value: 'UP', label:'UP'}, {value: 'DOWN', label:'DOWN'}], searchable: true },
  { key: 'created_at', label: '時間', type: 'datetime', searchable: true, overflow: true, fromTo: true },
];

const fields = {
    'name': {
      label: "Name",
      id: "name",
      type: "text",
      value: "",
      helper: "Enter the name of the server",
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
  name: 'servers',
  columns,
  actions,
  fields,
}

const serverSlice = combineSlices({
  name: 'servers',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      serverApi.endpoints.getServer.matchFulfilled,
      (state, action) => {
        state.server = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = serverSlice.actions;
export const { selectFormInputs } = serverSlice.selectors;
export const serverS = serverSlice
export default serverSlice.reducer