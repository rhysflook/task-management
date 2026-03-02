import { staffApi } from '../../services/staff';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'staff_id', label: 'スタッフNo.', overflow: true},
  { key: 'name', label: 'スタッフ名', overflow: true },
  { key: 'gender', label: '性別', overflow: true, valueMap: { 1: '男性', 2: '女性' }},
  // { key: 'unit_id', label: 'ユニット', overflow: true },
  { key: 'user_type', label: 'ユーザー種別', overflow: true },
  { key: 'actions', notDBVal: true, label: "", render: 'editAndDelete', align: 'center'},
];

const fields = {
   'staff_id': {
      label: "スタッフNo.",
      id: "staff_id",
      type: "text",
      value: "",
      required: true,
      sx: {
        marginTop: "4px",
        display: "flex",
        "& .MuiFormLabel-root": {
          width: "120px",       
      },
      "& .Mui-disabled": {
        color: '#000' 
      },
    },
    disabled: ['create', 'edit'],
    onRenderCallback: 'setNextStaffNo',  
   },
   'name': {
      label: "スタッフ名",
      id: "name",
      type: "text",
      value: "",
      required: true,
      sx: {
        marginTop: "4px",
        display: "flex",
        "& .MuiFormLabel-root": {
          width: "100px",       
      },
    },
   },
   'password': {
      label: "パスワード",
      id: "password",
      type: "password",
      value: "",
      required: true,
      sx: {
        marginTop: "4px",
        display: "flex",
        "& .MuiFormLabel-root": {
          width: "120px",       
      },
    },
   },
   'blank1': {
      label: "",
      id: "blank1",
      type: "blank",
      value: "",
      required: false,
      sx: {
        marginTop: "4px",
        display: "flex",
      },
   },
   'gender': {
      label: "性別",
      id: "gender",
      type: "select",
      value: "",
      required: true,
      sx: {
        display: "flex",
        alignItems: "center",
      "& .MuiBox-root.inner": {
        width: "40%",
      },
      "& .MuiFormControl-root": {
        gap: 1,
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        // width: "40%"
      },
      "& .MuiFormLabel-root": {
        width: "120px",       
      },
      "& .MuiSelect-root": {
        flex: 1,
      },
    },
    options: [
      { id: 1, name: "男性" },
      { id: 2, name: "女性" },
    ]
   },
   'blank2': {
      label: "",
      id: "blank2",
      type: "blank",
      value: "",
      required: false,
      sx: {
        marginTop: "4px",
        display: "flex",
      },
   },
   'unit_id': {
      label: "ユニット",
      id: "unit_id",
      type: "select",
      value: "",
      required: false,
      sx: {
        display: "flex",
        alignItems: "center",
      "& .MuiBox-root.inner": {
        width: "40%",
      },
      "& .MuiFormControl-root": {
        gap: 1,
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        // width: "40%"
      },
      "& .MuiFormLabel-root": {
        width: "120px",       
      },
      "& .MuiSelect-root": {
        flex: 1,
      },
    },
    options: []
   },
    'user_type': {
      label: "ユーザー種別",
      id: "user_type",
      type: "select",
      value: "",
      required: true,
      sx: {
        display: "flex",
        alignItems: "center",
      "& .MuiBox-root.inner": {
        width: "40%",
      },
      "& .MuiFormControl-root": {
        gap: 1,
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        // width: "40%"
      },
      "& .MuiFormLabel-root": {
        width: "120px",       
      },
      "& .MuiSelect-root": {
        flex: 1,
      },
    },
    options: [
      { id: 1, name: "介護スタッフ" },
      { id: 2, name: "看護師" },
      { id: 3, name: "事務職" },
      { id: 9, name: "システム管理者" },
    ]
   }
}

const actions = [
  'edit',
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'staff',
  columns,
  actions,
  fields,
}

const staffSlice = combineSlices({
  name: 'staff',
  initialState,
  reducers: {
    clearForm: (state) => {
          state.form.fields = JSON.parse(JSON.stringify(initialState.fields));
    },
  },
  features: ['table', 'form'],
  actions: {
    'create': ['create'],
    'edit': ['editAndOpen', 'delete']
  },
  checkBeforeDeletion: true,
  deletionConfirmationMessage: "スマホによるログインがされてますが、削除しますか？",
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      staffApi.endpoints.getStaff.matchFulfilled,
      (state, action) => {
      state.staff = action.payload.data;
      }
    );
  }
});
// Config for auto-increment field after creation
staffSlice.autoIncrementConfig = {
  fieldName: 'staff_id',
  extraDataKey: 'next_staff_id'
};

export const { getPage, setPerPage, setField, clearField, clearForm } = staffSlice.actions;
export const { selectFormInputs } = staffSlice.selectors;
export const staffS = staffSlice
export default staffSlice.reducer