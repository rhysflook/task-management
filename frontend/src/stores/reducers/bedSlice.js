import { bedApi } from '../../services/bed';
import { combineSlices } from './sliceBuilder';

const columns = [
  { key: 'bed_no', label: 'ベッドNo.', overflow: true },
  { key: 'extension', label: '№内線', overflow: true },
  { key: 'status', label: '状態区分', overflow: true },
  { key: 'actions', notDBVal: true, label: "", render: 'editAndDelete', align: 'center'}
];

const fields = {
  'is_blank': {
    label: "空床フラグ",
    id: "is_blank",
    type: "checkbox",
    titlePosition: "after",
    value: false,
    required: false,
    sx: {
      display: "flex",
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
      },
    }
  },
  'bed_no': {
    label: "ベッドNo.",
    id: "bed_no",
    type: "text",
    value: "",
    required: true,
  },
  'extension': {
    type: "select",
    id: "extension",
    label: "№内線",
    name: "extension",
    value: "",
    required: true,
  },
  'status': {
    type: "select",
    id: "status",
    label: "状態区分",
    name: "status",
    options: [
      {id: "空床", name: "空床"},
      {id: "入所", name: "入所"},
      {id: "外出", name: "外出"},
      {id: "退所", name: "退所"}
    ],
    required: true,
  }
};

const actions = ['edit'];

const initialState = {
  name: 'beds',
  columns,
  actions,
  fields,
};

const bedSlice = combineSlices({
  name: 'beds',
  initialState,
  reducers: {
    clearForm: (state) => {
      state.form.fields = JSON.parse(JSON.stringify(initialState.fields));
    },
  },
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      bedApi.endpoints.getBed.matchFulfilled,
      (state, action) => {
        state.bed = action.payload.data;
      }
    );
  }
});

// Export actions
export const { 
  getPage, 
  setPerPage, 
  setField, 
  clearField, 
  clearForm,
  setRedirectAfterSave,
  clearRedirectAfterSave,
  setPrefillData,
  clearPrefillData
} = bedSlice.actions;

export const { selectFormInputs } = bedSlice.selectors;
export const bedS = bedSlice;
export default bedSlice.reducer;