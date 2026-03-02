import { roomApi } from '../../services/room';
import { combineSlices } from './sliceBuilder';

const columns = [
  { key: 'unit_id', label: 'ユニット', overflow: true, type: 'select'},
  // { key: 'unit_id', label: 'ベッドNo.', overflow: true },
  { key: 'number', label: '居室No.', overflow: true },
  { key: 'name', label: '居室名', overflow: true },
  { key: 'bed_no', label: 'ベッドNo.', overflow: true },
  { key: 'client_id', label: 'ボタン№内線', overflow: true },
  { key: 'status', label: '状態区分', overflow: true, type: 'select' },
  { key: 'actions', notDBVal: true, label: "", render: 'edit', align: 'center'}
];

const fields = {
  'unit_id': {
    label: "ユニット",
    id: "unit_id",
    type: "select",
    value: "",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      "& .MuiFormControl-root": {
        gap: 1,
        display: "flex",
        flexDirection: "row",
        marginTop: "8px",
        width: "370px"
      },
      "& .MuiFormLabel-root": {
        width: "120px",       
      },
      "& .MuiSelect-root": {
        flexGrow: 1,
      },
    },
  },
  'number': {
    label: "居室No.",
    id: "number",
    type: "text",
    value: "",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      marginTop: "6px",
      "& .MuiFormLabel-root": {
        width: "110px",
        marginRight: "15px",
      },
      "& .MuiInputBase-root": {
        flexGrow: 1,
      },
       "& .Mui-disabled": {
        color: '#000'
      }
    },
     onRenderCallback: 'setNextRoomNo',
     disabled: ['create', 'edit'],
  },
  'name': {
    label: "居室名",
    id: "name",
    type: "text",
    value: "",
    required: true,
    sx: {
      display: "flex",
      alignItems: "center",
      marginTop: "6px",
      "& .MuiFormLabel-root": {
        width: "60px",
        marginRight: "15px",
      },
      "& .MuiInputBase-root": {
        flexGrow: 1,
      },
    },
  },
  'beds': {
    type: 'repeater',
    'feature': "rooms",
    'repeaterName': "beds",
    'title': "ベッド",
    'addButtonLabel': "ベッドを追加",
    'minItems': 1,
    'maxItems': 6,
    // 'fieldShellStyles': { fieldShell },
    // 'onChange': { handleBedCountChange },
    'gridColumns': "repeat(3, 1fr)",
    'gridGap': 1,
    'fields':  {
      'is_blank': {
        label: "ベット枠",
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
        },
        checkedCallback: 'toggleBedBlankStatus',
      },
      'bed_no': {
        label: "ベッドNo.",
        id: "bed_no",
        type: "text",
        value: "",
        required: true,
        max: 2,
        disabled: 'disableIfBlank',
        sx: {
          "& .Mui-disabled": {
            color: "#979191ff",
            backgroundColor: "#f5f5f5ff",
          }
        }
      },
      'client_id': {
        type: "select",
        id: "client_id",
        label: "内線№(ボタン)",
        name: "client_id",
        value: "",
        required: true,
        disabled: 'disableIfBlank',
        nullable: true,
        onChangeCallback: ['removeUsedClientFromOptions'],
        onLoadCallback: 'updateClientOptions', // only for edit mode (did I break something here by putting onLoadCallback only for edit mode in FormSelect.jsx?)
        onRemoveCallback: 'updateAllClientOptions', // Only trigger when repeater item is removed
        sx: {
          "& .Mui-disabled": {
            color: "#979191ff",
            backgroundColor: "#f5f5f5ff",
          }
        }
      },      
    }
  }
};

const actions = ['edit'];

const initialState = {
  name: 'rooms',
  columns,
  actions,
  fields,
  getRecordCallback: 'loadBlankBeds',
};

/**
 * Create room slice with table, form, and beds repeater
 * 
 * Redux structure:
 * state.rooms = {
 *   form: { fields: { unit_id, number, name } },
 *   table: { ... },
 *   repeaters: {
 *     beds: [
 *       { bed_no: "101", extension: "1001", status: "空床", is_blank: false },
 *       { bed_no: "102", extension: "1002", status: "入所", is_blank: false },
 *     ]
 *   }
 * }
 */
const roomSlice = combineSlices({
  name: 'rooms',
  initialState,
  reducers: {
    clearForm: (state) => {
      state.form.fields = JSON.parse(JSON.stringify(initialState.fields));
    },
    
    /**
     * Clear everything: room form + all repeaters (including beds)
     */
    clearAll: (state) => {
      state.form.fields = JSON.parse(JSON.stringify(initialState.fields));
      state.repeaters = {};
    },
  },
  features: ['table', 'form'],
  repeaters: ['beds'], // Enable beds repeater for rooms
  actions: {
    'create': ['createWithSubFeature'],
    'edit': ['editWithSubFeature']
  },
  checkBeforeDeletion: true,
  deletionConfirmationMessage: "ベットは空床ではありまんが、削除しますか？",

  applyExtraReducers: (builder) => {
    builder.addMatcher(
      roomApi.endpoints.getRoom.matchFulfilled,
      (state, action) => {
      state.room = action.payload.data;
      }
    );
  }
});

roomSlice.autoIncrementConfig = {
  fieldName: 'number',
  extraDataKey: 'next_room_no'
};

// Export all actions including repeater actions
export const { 
  getPage, 
  setPerPage, 
  setField,
  clearField, 
  clearForm,
  clearAll,
  // Repeater actions (for managing beds within a room)
  addRepeaterItem,
  removeRepeaterItem,
  setRepeaterField,
  loadRepeaterItems,
  clearRepeater,
  clearAllRepeaters,
} = roomSlice.actions;

export const { selectFormInputs } = roomSlice.selectors;
export const roomS = roomSlice;
export default roomSlice.reducer;