import { current } from '@reduxjs/toolkit';
import { unitMapApi } from '../../services/unitMap';
import { combineSlices } from './sliceBuilder';
import { v4 as uuidv4 } from 'uuid';
import { patientApi } from '../../services/patient';
// Define a type for the slice state


const columns = [
  { key: 'name', label: 'Name', overflow: true, searchable: true },
];

const fields = {
    'name': {
      label: "Name",
      id: "name",
      type: "text",
      value: "",
      helper: "Enter the name of the unitMap",
      required: true,
      sx: {width: "20%", marginTop: "2rem"}
   },
   'group': {
    label: "Group",
    id: "group",
    type: "select",
    value: null,
    options: [{id: 1, name: "Group 1"}, {id: 2, name: "Group 2"}],
    helper: "Select the group for the example",
    required: true,
    sx: {width: "20%", marginTop: "2rem"}
 }
}

const actions = [
  'edit',
];

// Define the initial state using that type
const initialState = {
  // ...getFeatureInitialState(['table']),
  name: 'unitMaps',
  mode: 'action',
  columns,
  actions,
  fields,
  floors: [
   
  ],
  currentFloor: 1,
  visibleMenuId: null,
  snapToGrid: true,
  gridSize: 20,
  stagedPatients: [],
  inCallPatients: {},
}

const unitMapSlice = combineSlices({
  name: 'unitMaps',
  initialState,
  reducers: {
    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },
    setGridSize: (state, action) => { 
      state.gridSize = action.payload;
    },
    setPos: (state, action) => {
      const { id, floor, x, y } = action.payload;
      const item = state.floors.find(f => f.id == floor).rooms.find(i => i.id == id);
      if (item) {
        item.x = x;
        item.y = y;
      }
    },
    setSize: (state, action) => {
      const { id, floor, w, h } = action.payload;
      const item = state.floors.find(f => f.id == floor).rooms.find(i => i.id == id);
      if (item) {
        item.w = w;
        item.h = h;
        item.width = w;
        item.height = h;
      }
    },
    selectFloor: (state, action) => {
      const { id } = action.payload;
      state.currentFloor = id;
    },
    addFloor: (state, action) => {
      const { name } = action.payload;
      // Find the next possible id
      const nextId = uuidv4();
      state.floors.push({ id: nextId, name, rooms: [] });
      state.currentFloor = nextId;
    },
    addItem: (state, action) => {
      const { floor, item } = action.payload;
      item.id = uuidv4();
      state.floors.find(f => f.id == floor).rooms.push(item);
    },
    adjustRoomGrid: (state, action) => {
      const { id, floor, rows, cols } = action.payload;
      const item = state.floors.find(f => f.id == floor).rooms.find(i => i.id == id && i.type === 'room');
      if (item) {
        item.grid_rows = rows;
        item.grid_columns = cols;
      }
    },
    addBedToRoom: (state, action) => {
      const { roomId, floor, bed } = action.payload;
      // console.log(floor, roomId)
      bed.id = uuidv4();
      const floorData = state.floors.find(f => f.id == floor);
      const roomItem = floorData.rooms.find(i => i.id == roomId);
      if (roomItem) {
        if (!roomItem.beds) {
          roomItem.beds = [];
        }
        roomItem.beds.push(bed);
      }

      if (roomItem.beds.length > roomItem.grid_rows * roomItem.grid_columns) {
        if (roomItem.grid_columns <= roomItem.grid_rows) {
          roomItem.grid_columns += 1; // Increase columns if rows are less than or equal to columns
        } else {
          roomItem.grid_rows += 1; // Otherwise, increase rows
        }
      }

      state.floors = [...state.floors.filter(floor => floor.id != floorData.id), floorData];
      // console.log(state.floors);
    },
    deleteFloor: (state, action) => {
      const { id } = action.payload;
      state.floors = state.floors.filter(floor => floor.id != id);
      state.currentFloor = state.floors[0].id;
    },
    deleteItem: (state, action) => {
      const { floor, id } = action.payload;
      // console.log(floor, id)
      state.floors.find(f => f.id == floor).rooms = state.floors.find(f => f.id == floor).rooms.filter(i => i.id !== id);
    },
    moveFloorUp: (state) => {
      const floors = state.floors;
      const currentFloor = floors.find(f => f.id == state.currentFloor);
      const currentIndex = floors.indexOf(currentFloor);
      if (currentIndex < floors.length - 1) {
        // Swap the current floor with the next one
        const nextFloor = floors[currentIndex + 1];
        floors[currentIndex + 1] = currentFloor;
        floors[currentIndex] = nextFloor;
        state.floors = floors;
      }
    },
    moveFloorDown: (state) => {
      const floors = state.floors;
      const currentFloor = floors.find(f => f.id == state.currentFloor);
      const currentIndex = floors.indexOf(currentFloor);
      if (currentIndex > 0) {
        // Swap the current floor with the previous one
        const prevFloor = floors[currentIndex - 1];
        floors[currentIndex - 1] = currentFloor;
        floors[currentIndex] = prevFloor;
        state.floors = floors;
      }
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setVisibleMenuId: (state, action) => {
      state.visibleMenuId = action.payload;
    },
   movePatientToRoom: (state, action) => {
      const { patientId, targetBedId, floor } = action.payload;

      return {
        ...state,
        floors: state.floors.map(f => {
          if (f.id !== floor) return f;

          // Map over all rooms on this floor
          const updatedRooms = f.rooms.map(room => {
            // Each room has an array of beds — update them
            const updatedBeds = room.beds.map(bed => {
              // --- 1️⃣ Remove patient from their current bed ---
              if (bed.patient?.id === patientId) {
                return { ...bed, patient: null };
              }

              // --- 2️⃣ Assign patient to target bed ---
              if (bed.id === targetBedId) {
                // Try to retrieve full patient object from existing data
                const movedPatient =
                  f.rooms
                    .flatMap(r => r.beds)
                    .find(b => b.patient?.id === patientId)?.patient ||
                  { id: patientId, name: `Patient ${patientId}` };

                return { ...bed, patient: movedPatient };
              }

              // --- 3️⃣ All other beds remain unchanged ---
              return bed;
            });

            return { ...room, beds: updatedBeds };
          });

          return { ...f, rooms: updatedRooms };
        }),
        visibleMenuId: null,
      };
    },
    stagePatient(state, action) {
      // console.log("staging patient: ", action.payload);
      // find patient id via bed id
      const patient = state.floors.flatMap(floor => 
        floor.rooms.flatMap(room => 
          room.beds.find(bed => bed.id == action.payload.fromBedId)
        )
      ).find(bed => bed != undefined)?.patient;

      if (!patient) {
        return;
      }
      state.floors = state.floors.map(f => {
        const updatedRooms = f.rooms.map(room => {
          const updatedBeds = room.beds.map(bed => {
            if (bed.patient?.id === action.payload.patientId) {
              return { ...bed, patient: null };
            }
            return bed;
          });
          return { ...room, beds: updatedBeds };
        });
        return { ...f, rooms: updatedRooms };
      });
      state.stagedPatients = [
        ...state.stagedPatients,
        patient
      ];
    },

    unstagePatientToBed(state, action) {
      const { patientId, targetBedId } = action.payload;
      // console.log("unstaging patient to bed: ", patientId, targetBedId);
      state.floors = state.floors.map(f => {
        const updatedRooms = f.rooms.map(room => {
          const updatedBeds = room.beds.map(bed => {
            if (bed.id === targetBedId) {
              const movedPatient = state.stagedPatients.find(p => p.id === patientId);
              state.stagedPatients = state.stagedPatients.filter(p => p.id !== patientId);
              return { ...bed, patient: movedPatient };
            }
            return bed;
          });
          return { ...room, beds: updatedBeds };
        });
        return { ...f, rooms: updatedRooms };
      });
    },

    removePatientFromBed(state, patientId) {
      state.floors = state.floors.map(f => {
        const updatedRooms = f.rooms.map(room => {
          const updatedBeds = room.beds.map(bed => {
            if (bed.patient?.id === patientId) {
              return { ...bed, patient: null };
            }
            return bed;
          });
          return { ...room, beds: updatedBeds };
        });
        return { ...f, rooms: updatedRooms };
      });
    },
    
    assignPatientToBed(state, { patientId, targetBedId }) {
      state.floors = state.floors.map(f => {
        const updatedRooms = f.rooms.map(room => {
          const updatedBeds = room.beds.map(bed => {
            if (bed.id === targetBedId) {
              const movedPatient =
                { id: patientId, name: `Patient ${patientId}` };
              return { ...bed, patient: movedPatient };
            }
            return bed;
          });
          return { ...room, beds: updatedBeds };
        });
        return { ...f, rooms: updatedRooms };
      });
    },
    addToIncallPatients(state, action) {
      const patient = action.payload;
      state.inCallPatients[patient] = patient;
    },
    removeFromIncallPatients(state, action) {
      const patientId = action.payload;
      delete state.inCallPatients[patientId];
    },
  },
  features: ['table', 'form'],
  actions: {
    'create': ['createAndOpen'],
    'edit': ['editAndOpen', 'delete']
  },
  applyExtraReducers: (builder) => {
    builder.addMatcher(
      unitMapApi.endpoints.getUnitMap.matchFulfilled,
      (state, action) => {
        const unitMap = action.payload.data;
        // console.log(unitMap);
        state.floors = unitMap || [];
        // console.log(current(state));
        state.currentFloor = state.floors.length ? state.floors[0].id : null;
      }
    ),
    builder.addMatcher(
      patientApi.endpoints.getStagedPatients.matchFulfilled,
      (state, action) => {
        state.stagedPatients = action.payload.data || [];
      }
    ),
    builder.addMatcher(
      patientApi.endpoints.getInCallPatients.matchFulfilled,
      (state, action) => {
        const inCallPatientsArray = action.payload.data || [];
        const inCallPatientsMap = {};
        inCallPatientsArray.forEach(patient => {
          inCallPatientsMap[patient.id] = patient.id;
        });
        state.inCallPatients = inCallPatientsMap;
      }
    );
  }
});

export const {
  toggleSnapToGrid,
  setGridSize,
  getPage,
  setPerPage,
  setField,
  clearField,
  clearForm,
  setPos,
  setSize,
  addFloor,
  addItem,
  deleteFloor,
  deleteItem,
  selectFloor,
  moveFloorUp,
  moveFloorDown,
  setMode,
  setVisibleMenuId,
  addBedToRoom,
  addToIncallPatients,
  removeFromIncallPatients,
} = unitMapSlice.actions;
export const { selectFormInputs } = unitMapSlice.selectors;
export const unitMapS = unitMapSlice
export default unitMapSlice.reducer