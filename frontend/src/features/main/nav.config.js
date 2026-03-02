import {
  PeopleAltOutlined as PatientsIcon,
  DoorFrontOutlined as RoomsIcon,
  MapOutlined as UnitMapIcon,
  ListAltOutlined as LogsIcon,
} from "@mui/icons-material";

// export type NavItem = {
//   label: string;
//   path?: string;              // route (omit if it's a section or has children only)
//   icon?: React.ElementType;   // MUI icon component
//   badge?: number | string;    // small count/badge
//   external?: boolean;         // open in new tab
//   disabled?: boolean;
//   roles?: string[];           // e.g., ["admin"]
//   dividerAbove?: boolean;     // visual divider
//   section?: string;           // renders a small heading
//   children?: NavItem[];       // nested routes (optional)
// };

export const navItems = [
  { section: "メイン" },

  {
    label: "患者",
    path: "/patients/list",
    icon: PatientsIcon,
  },
  // {
  //   label: "ユニット",
  //   path: "/units/list",
  // },
  {
    label: "居室",
    path: "/rooms/list",
    icon: RoomsIcon,
  },
  //  {
  //   label: "スタッフ",
  //   path: "/staff/list",
  // },
  {
    label: "ユニットマップ",
    path: "/unitMaps",
    icon: UnitMapIcon,
  },

  { dividerAbove: true },

  {
    label: "ログ",
    path: "/logs/list",
    icon: LogsIcon,
    badge: 3, // example
  },
];