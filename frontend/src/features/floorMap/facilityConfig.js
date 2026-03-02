// src/features/floorMap/facilityConfig.js
import BathtubRounded from '@mui/icons-material/BathtubRounded';
import Elevator from '@mui/icons-material/Elevator';                // may exist
import ApartmentRounded from '@mui/icons-material/ApartmentRounded'; // fallback
import maleToilet from '../../assets/utilities/male-toilet.png';
import femaleToilet from '../../assets/utilities/female-toilet.png';
import mixedToilet from '../../assets/utilities/mixed-toilet.png';
import disabledToilet from '../../assets/utilities/disabled-toilet.png';
import bathroom from '../../assets/utilities/bath.png';
import elevator from '../../assets/utilities/elevator.png';
import stairs from '../../assets/utilities/stairs.png';
import storage from '../../assets/utilities/storage.png';
import clothes from '../../assets/utilities/clothes.png';
import station from '../../assets/utilities/station.png';
import washing from '../../assets/utilities/washing.png';
// Use Elevator if present, otherwise a generic building icon
const ElevatorIcon = Elevator || ApartmentRounded;
// Reuse WcRounded for “restroom” if RestroomRounded isn’t available
export const FACILITY_KINDS = {
  toiletMixed: {
    label: '多目的トイレ（男女共用）',
    icon: mixedToilet, // Placeholder, replace with a mixed icon if available
    color: '#8b5cf6',
    defaultSize: { w: 80, h: 80 },
  },
  toiletMen: {
    label: 'お手洗い',
    icon: maleToilet,
    color: '#0ea5a6',
    defaultSize: { w: 80, h: 80 },
  },
  toiletWomen: {
    label: 'お手洗い（女性）',
    icon: femaleToilet,
    color: '#ec4899',
    defaultSize: { w: 80, h: 80 },
  },
  toiletDisabled: {
    label: '多目的トイレ（バリアフリー）',
    icon: disabledToilet, // Placeholder, replace with a disabled icon if available
    color: '#f59e0b',
    defaultSize: { w: 80, h: 80 },
  },
  bathroom: {
    label: '浴室',
    icon: bathroom,
    color: '#7c3aed',
    defaultSize: { w: 100, h: 80 },
  },
  elevator: {
    label: 'エレベーター',
    icon: elevator,
    color: '#0ea5e9',
    defaultSize: { w: 80, h: 100 },
  },
  stairs: {
    label: '階段',
    icon: stairs,
    color: '#6b7280',
    defaultSize: { w: 80, h: 100 },
  },
  warehouse: {
    label: '倉庫',
    icon: storage,
    color: '#f97316',
    defaultSize: { w: 120, h: 80 },
  },
   washing: {
    label: 'リンネ庫',
    icon: clothes,
    color: '#f97316',
    defaultSize: { w: 120, h: 80 },
  },
  nurseStation: {
    label: 'ナースステーション',
    icon: station,
    color: '#f97316',
    defaultSize: { w: 120, h: 80 },
  },
  sink: {
    label: '洗濯室',
    icon: washing,
    color: '#10b981',
    defaultSize: { w: 80, h: 60 },
  },
};

export const getFacilityConfig = (kind) =>
  FACILITY_KINDS[kind] || FACILITY_KINDS.toilet;
