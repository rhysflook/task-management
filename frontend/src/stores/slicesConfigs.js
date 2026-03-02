import { exampleS } from './reducers/exampleSlice';
import { patientS } from './reducers/patientSlice';
import { unitMapS } from './reducers/unitMapSlice';
import { logS } from './reducers/logSlice';
import { unitS } from './reducers/unitSlice';
import { roomS } from './reducers/roomSlice';
import { staffS } from './reducers/staffSlice';
import { serverS } from './reducers/serverSlice';
import { bedS } from './reducers/bedSlice';
import { extensionS } from './reducers/extensionSlice';
import { clientS } from './reducers/clientSlice';
import { ringGroupS } from './reducers/ringGroupSlice';

export const sliceConfigs = {
  'examples': exampleS,
  'unitMaps': unitMapS,
  'patients': patientS,
  'logs': logS,
  'servers': serverS,
  'units': unitS,
  'rooms': roomS,
  'staff': staffS,
  'beds': bedS,
  'extensions': extensionS,
  'clients': clientS,
  'ringGroups': ringGroupS,
};