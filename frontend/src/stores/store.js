import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authSlice'
import exampleReducer, { exampleS } from './reducers/exampleSlice'
import patientReducer, { patientS } from './reducers/patientSlice'
import unitMapReducer, { unitMapS } from './reducers/unitMapSlice'
import logReducer, {logS} from './reducers/logSlice'
import unitReducer, { unitS } from './reducers/unitSlice'
import roomReducer, { roomS } from './reducers/roomSlice'
import staffReducer, { staffS } from './reducers/staffSlice'
import serverReducer, { serverS } from './reducers/serverSlice'
import bedReducer, { bedS } from './reducers/bedSlice'
import extensionReducer, { extensionS } from './reducers/extensionSlice'
import clientReducer, { clientS } from './reducers/clientSlice'
import ringGroupReducer, { ringGroupS } from './reducers/ringGroupSlice'
import { tablesApi } from '../services/tables'
import { formApi } from '../services/form'
import { authApi } from '../services/auth'
import { exampleApi } from '../services/example'
import { unitMapApi } from '../services/unitMap'
import { patientApi } from '../services/patient'
import { logApi } from '../services/log'
import { serverApi } from '../services/server'
import { unitApi } from '../services/unit'
import { roomApi } from '../services/room'
import { staffApi } from '../services/staff'
import { bedApi } from '../services/bed';
import { extensionApi } from '../services/extension';
import { clientApi } from '../services/client';
import { ringGroupApi } from '../services/ringGroup';

export const store = configureStore({
  reducer: {
    [formApi.reducerPath]: formApi.reducer,
    [tablesApi.reducerPath]: tablesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [exampleApi.reducerPath]: exampleApi.reducer,
    [unitMapApi.reducerPath]: unitMapApi.reducer,
    [patientApi.reducerPath]: patientApi.reducer,
    [logApi.reducerPath]: logApi.reducer,
    [serverApi.reducerPath]: serverApi.reducer,
    [unitApi.reducerPath]: unitApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [bedApi.reducerPath]: bedApi.reducer,
    [extensionApi.reducerPath]: extensionApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [ringGroupApi.reducerPath]: ringGroupApi.reducer,
    logs: logReducer,
    auth: authReducer,
    examples: exampleReducer,
    unitMaps: unitMapReducer,
    patients: patientReducer,
    servers: serverReducer,
    units: unitReducer,
    rooms: roomReducer,
    staff: staffReducer,
    beds: bedReducer,
    extensions: extensionReducer,
    clients: clientReducer,
    ringGroups: ringGroupReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      tablesApi.middleware,
      formApi.middleware, 
      authApi.middleware, 
      exampleApi.middleware,
      unitMapApi.middleware,
      patientApi.middleware,
      logApi.middleware,
      serverApi.middleware,
      unitApi.middleware,
      roomApi.middleware,
      staffApi.middleware,
      bedApi.middleware,
      extensionApi.middleware,
      clientApi.middleware,
      ringGroupApi.middleware,
    ),
})

export const slices = {
  'examples': exampleS.selectors,
  'unitMaps': unitMapS.selectors,
  'patients': patientS.selectors,
  'logs': logS.selectors,
  'servers': serverS.selectors,
  'units': unitS.selectors,
  'rooms': roomS.selectors,
  'staff': staffS.selectors,
  'beds': bedS.selectors,
  'extensions': extensionS.selectors,
  'clients': clientS.selectors,
  'ringGroups': ringGroupS.selectors,
};

export const actions = {
  'examples': exampleS.actions,
  'unitMaps': unitMapS.actions,
  'patients': patientS.actions,
  'logs': logS.actions,
  'servers': serverS.actions,
  'units': unitS.actions,
  'rooms': roomS.actions,
  'staff': staffS.actions,
  'beds': bedS.actions,
  'extensions': extensionS.actions,
  'clients': clientS.actions,
  'ringGroups': ringGroupS.actions,
};


