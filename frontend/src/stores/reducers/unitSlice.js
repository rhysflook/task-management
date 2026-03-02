import { unitApi } from '../../services/unit';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'name', label: 'ユニット名', overflow: true },
  { key: 'unit_no', label: 'ユニット', overflow: true },
  { key: 'staff_id_1', label: 'スマホ内線', overflow: true },
  { key: 'staff_name_1', label: '携帯スタッフ名', overflow: true },
  { key: 'staff_id_2', label: 'スマホ内線', overflow: true },
  { key: 'staff_name_2', label: '携帯スタッフ名', overflow: true },
  { key: 'staff_id_3', label: 'スマホ内線', overflow: true },
  { key: 'staff_name_3', label: '携帯スタッフ名', overflow: true },
  { key: 'actions', notDBVal: true, label: "", render: 'edit', align: 'center'}
];

const fields = {
  'unit_no': {
      label: "ユニットNo.",
      id: "unit_no",
      type: "text",
      value: "",
      required: true,
      sx: {
      marginTop: "4px",
      display: "flex",
      gap: 3,
      "& .MuiFormLabel-root": {
        width: "120px",       
      },
      "& .Mui-disabled": {
        color: "#2e2c2cff",
      }
    },
    disabled: ['edit']
   },
  'name': {
      label: "ユニット名",
      id: "name",
      type: "text",
      value: "",
      required: true,
      sx: {
      marginTop: "4px",
      display: "flex",
      gap: 3,
      "& .MuiFormLabel-root": {
        width: "100px",       
      },
    },
   },
}

const actions = [
  'edit',
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'units',
  columns,
  actions,
  fields,
}

const unitSlice = combineSlices({
  name: 'units',
  initialState,
  reducers: {
    clearForm: (state) => {
          state.form.fields = JSON.parse(JSON.stringify(initialState.fields));
    },
  },
  features: ['table', 'form'],
  actions: {
    'create': ['create'],
    'edit': ['editAndOpen']
  },
  cascadeOnDelete: ['rooms'],
  checkBeforeDeletion: true,
  deletionConfirmationMessage: "スマホによるログインがされてますが、削除しますか？",
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      unitApi.endpoints.getUnit.matchFulfilled,
      (state, action) => {
      state.unit = action.payload.data;
      }
    );
  }
});

export const { getPage, setPerPage, setField, clearField, clearForm } = unitSlice.actions;
export const { selectFormInputs } = unitSlice.selectors;
export const unitS = unitSlice
export default unitSlice.reducer