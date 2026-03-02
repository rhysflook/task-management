import { logApi } from '../../services/log';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'staff_name', label: 'スタッフ名', overflow: true, searchable: true, searchRenderOrder: 1 },
  { key: 'extension', label: '内線', overflow: true },
  { key: 'patient_name', label: '入居者名', overflow: true },
  { key: 'data_kbn', label: 'データ区分', overflow: true, styleCallback: 'setDeadPiRedStyle' },
  { key: 'time_stamp', label: '時間', overflow: true, searchable: true, type: 'date', searchRenderOrder: 3, fromTo: true},
  { key: 'unit_name', label: 'ユニット名', overflow: true, searchable: true, searchRenderOrder: 2, type: 'select'},
  { key: 'room_name', label: '居室名', overflow: true},
  { key: 'bed_no', label: 'ベッド№', overflow: true },
];

const fields = {
    'name': {
      label: "Name",
      id: "name",
      type: "text",
      value: "",
      helper: "Enter the name of the log",
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
  name: 'logs',
  columns,
  actions,
  fields,
}

const logSlice = combineSlices({
  name: 'logs',
  initialState,
  reducers: {},
  features: ['table', 'form'],
  actions: {
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      logApi.endpoints.getLog.matchFulfilled,
      (state, action) => {
      state.log = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = logSlice.actions;
export const { selectFormInputs } = logSlice.selectors;
export const logS = logSlice
export default logSlice.reducer