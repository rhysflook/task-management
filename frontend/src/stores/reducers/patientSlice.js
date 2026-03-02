import { patientApi } from '../../services/patient';
import { combineSlices } from './sliceBuilder';
// Define a type for the slice state


const columns = [
  { key: 'patient_no', label: '入所者No.', overflow: true },
  { key: 'name', label: '姓名', overflow: true },
  { key: 'birth_day', label: '生年月日', overflow: true },
  { key: 'gender', label: '性別', overflow: true, valueMap: { '1': '男性', '2': '女性' } },
  { key: 'unit_id', label: 'ユニット', overflow: true, searchable: true, type: 'select',
  },
  { key: 'room_id', label: '居室', overflow: true, type: 'select'},
  { key: 'bed_id', label: 'ベッド', overflow: true, type: 'select'},
  { key: 'section', label: '入所者区分', overflow: true, valueMap: { '1': '入所', '2': '退所' }},
  { key: 'admission_day', label: '入所日', overflow: true, format: "y-m-d h:i", searchable: true, type: "month", fromTo: true },
  { key: 'discharge_day', label: '退所日', overflow: true, format: "y-m-d h:i " },
  { key: 'actions', notDBVal: true, label: "", render: 'editAndDelete', align: 'center'}
];

const fields = {
 'patient_no': {
    label: "入所者No.",
    id: "patient_no",
    type: "text",
    value: "",
    required: true,
    sx: {
      marginTop: "4px",
      display: "flex",
      gap: 3,
      "& .MuiFormLabel-root": {
        width: "95px",       
      },
      "& .Mui-disabled": {
        color: '#000'
      }
    },
    onRenderCallback: 'setNextPatientNo',
    disabled: ['create', 'edit'],
  },
  'name': {
    label: "姓名",
    id: "name",
    type: "text",
    value: "",
    required: true,
    sx: { marginTop: "4px", display: "flex", gap: 1,"& .MuiFormLabel-root": {
        width: "95px",       
      }, }
  },
  'kana': {
    label: "カナ",
    id: "kana",
    type: "text",
    value: null,
    required: true,
    sx: { marginTop: "4px", display: "flex", gap: 1, "& .MuiFormLabel-root": {
        width: "95px",       
      },}
  },
  'birth_day': {
    label: "生年月日",
    id: "birth_day",
    type: "datetime-picker",
    required: true,
    sx: { marginTop: "4px", display: "flex", gap: 1,
        "& .MuiFormLabel-root": {
        width: "95px",       
      },
     },
     onRenderCallback: 'setBirthDayTo60YearsAgo',
  },
  'gender': {
    label: "性別",
    id: "gender",
    type: "select",
    required: true,
    sx: {
      display: "flex",        
      alignItems: "center",              
      "& .MuiBox-root.inner": {
        minWidth: "80%",
      },
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        width: "100%"
      },
      "& .MuiFormLabel-root": {
        width: "95px",       
      },
      "& .MuiSelect-root": {
        flexGrow: 1,
      },

    },
    options: [
      { id: "1", name: "男性" },
      { id: "2", name: "女性" },
    ]
  },
  'unit_id': {
    label: "ユニット",
    id: "unit_id",
    type: "select",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      "& .MuiBox-root.inner": {
        minWidth: "80%",
      },
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        width: "100%"

      },
      "& .MuiFormLabel-root": {
        width: "95px",
      },
      "& .MuiSelect-root": {
        flex: 1,
      },
    },
    searchable: true,
    onChangeCallback: ['getRoomsByUnitChange', 'getBedsByUnit'],
    onLoadCallback: 'getRoomsByUnitLoad', // only for edit mode
    // optionsEndpoint: patientApi.endpoints.getUnits,
    // options: [
    //   { id: "1", name: "ひまわり" },
    //   { id: "2", name: "さくら" },
    // ]
  },
  'blank1': {
    label: "",
    id: "blank",
  },
  'room_id': {
    label: "居室",
    id: "room_id",
    type: "select",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      "& .MuiBox-root.inner": {
        minWidth: "80%",
      },
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        width: "100%"
      },
      "& .MuiFormLabel-root": {
        width: "95px",
      },
      "& .MuiSelect-root": {
        flexGrow: 1,
      },
    },
    searchable: true,
    onChangeCallback: ['getBedsByRoomChange'],
    onLoadCallback: 'getBedsByRoomLoad', // only for edit mode
  },
  'blank2': {
    label: "",
    id: "blank",
  },
  'bed_id': {
    label: "ベッド",
    id: "bed_id",
    type: "select",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      "& .MuiBox-root.inner": {
        minWidth: "80%",
      },
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        width: "100%"
      },
      "& .MuiFormLabel-root": {
        width: "95px",
      },
      "& .MuiSelect-root": {
        flexGrow: 1,
      },

    },
    searchable: true,
  },
  'blank3': {
    label: "",
    id: "blank",
  },
  'section': {
    label: "入所者区分",
    id: "section",
    type: "select",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      "& .MuiBox-root.inner": {
        minWidth: "80%",
      },
      "& .MuiFormControl-root": {
        display: "flex",
        flexDirection: "row",
        // marginTop: "8px",
        width: "100%"
      },
      "& .MuiFormLabel-root": {
        width: "95px",
      },
      "& .MuiSelect-root": {
        flexGrow: 1,
      },
  
    },
    onLoadCallback: 'setPatientStatusOptions',
    loadCallbackScope: ['create', 'edit'],
    options: [
      // { id: "2", name: "入所" },
      // { id: "1", name:"空床" },
      // { id: "3", name:"外出", scope: ['edit'] },
      // { id: "4", name: "退所", scope: ['edit'] },
    ],
  },
  'admission_day': {
    label: "入所日",
    id: "admission_day",
    type: "datetime-picker",
    required: true,
    hasTime: true,
    sx: {  display: "flex", gap: 1,
      "& .MuiFormLabel-root": {
        width: "95px",
      },
    }
  },
  'outing_start': {
    label: "外泊開始",
    id: "outing_start",
    type: "datetime-picker",
    required: false,
    scopes: ['edit'],
    hasTime: true,
    sx: { marginTop: "8px", display: "flex", gap: 1,
      "& .MuiFormLabel-root": {
        width: "95px",
      },
    }
  },
  'outing_end': {
    label: "外泊終了",
    id: "outing_end",
    type: "datetime-picker",
    required: false,
    scopes: ['edit'],
    hasTime: true,
    sx: { marginTop: "8px", display: "flex", gap: 1,
      "& .MuiFormLabel-root": {
        width: "95px",
      },
    }
  },
  'discharge_day': {
    label: "退所日",
    id: "discharge_day",
    type: "datetime-picker",
    required: true,
    sx: { marginTop: "8px", display: "flex", gap: 5,
      "& .MuiFormLabel-root": {
        width: "95px",
      } },
    scopes: ['edit']
  },

}

const actions = [
  'edit',
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'patients',
  columns,
  fields,
  actions,
}

const patientSlice = combineSlices({
  name: 'patients',
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
  deletionConfirmationMessage: "この入居者様を削除しますか？",
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      patientApi.endpoints.getPatient.matchFulfilled,
      (state, action) => {
        state.patient = action.payload.data;
      }
    );
  }
});
// Config for auto-increment field after creation
patientSlice.autoIncrementConfig = {
  fieldName: 'patient_no',
  extraDataKey: 'next_patient_no'
};

export const { 
  getPage, 
  setPerPage, 
  setField, 
  setOptions,
  clearField, 
  clearForm,
  resetInitialLoad,
  setRedirectAfterSave,
  clearRedirectAfterSave,
  setPrefillData,
  clearPrefillData
} = patientSlice.actions;
export const { selectFormInputs } = patientSlice.selectors;
export const patientS = patientSlice
export default patientSlice.reducer
