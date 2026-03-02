import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer,
  List, ListItemButton, ListItemIcon, ListItemText, Divider
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogoutMutation } from "../../services/auth";
import { clearUser, inTypes, UserType } from "../../stores/reducers/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import SummarizeIcon from '@mui/icons-material/Summarize';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import useCustomNavigate from "../../hooks/useCustomNavigate";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;
const railWidth = 72;

const MainLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const customNavigate = useCustomNavigate();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  // expanded vs mini-rail (never overlays)
  const sidebarWidth = user ? (drawerOpen ? drawerWidth : railWidth) + "px" : '0';

  async function handleAuthClick() {
    if (!user) {
      useCustomNavigate("/login");
    } else {
      try { await logout().unwrap(); }
      finally { dispatch(clearUser()); useCustomNavigate("/login"); }
    }
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const DrawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    {/* start under AppBar */}
    {/* <Toolbar /> */}
    <Divider />

    {/** submenu open states */}
    {(() => {
      // keep this tiny state local to this block
      const [open, setOpen] = useState({
        patients: false,
        units: false,
        rooms: false,
        staff: false,
        logs: false,
        facility: false
      });

      const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

      return (
        <>
          <List sx={{ py: 0 }}>
            {/* Dashboard (single) */}
            <ListItemButton onClick={() => customNavigate("/")} sx={{ py: 1.2 }}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="フロアＭＡＰ" />
            </ListItemButton>

            {/* Patients (submenu) */}
            <ListItemButton onClick={() => toggle('patients')} sx={{ py: 1.2 }}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="入所者管理" />
              {open.patients ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
  <Collapse in={open.patients} timeout="auto" unmountOnExit>
    <List disablePadding>
      <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/patients/list")}>
        <ListItemText primary="一覧" />
      </ListItemButton>
      <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/patients/create")}>
        <ListItemText primary="新規" />
      </ListItemButton>
    </List>
  </Collapse>
  {inTypes(user, [UserType.ADMIN, UserType.SUPERUSER]) && (
    <>
      {/* Units (submenu) */}
      <ListItemButton onClick={() => toggle('units')} sx={{ py: 1.2 }}>
        <ListItemIcon><ApartmentIcon /></ListItemIcon>
        <ListItemText primary="ユニット" />
        {open.units ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open.units} timeout="auto" unmountOnExit>
        <List disablePadding>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/units/list")}>
            <ListItemText primary="一覧" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/units/create")}>
            <ListItemText primary="新規" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Rooms (submenu) */}
      <ListItemButton onClick={() => toggle('rooms')} sx={{ py: 1.2 }}>
        <ListItemIcon><MeetingRoomIcon /></ListItemIcon>
        <ListItemText primary="居室" />
        {open.rooms ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open.rooms} timeout="auto" unmountOnExit>
        <List disablePadding>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/rooms/list")}>
            <ListItemText primary="一覧" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/rooms/create")}>
            <ListItemText primary="新規" />
          </ListItemButton>
        </List>
      </Collapse>
      {/* Staff (submenu) */}
      <ListItemButton onClick={() => toggle('staff')} sx={{ py: 1.2 }}>
        <ListItemIcon><PersonIcon /></ListItemIcon>
        <ListItemText primary="スタッフ" />
        {open.staff ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open.staff} timeout="auto" unmountOnExit>
        <List disablePadding>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/staff/list")}>
            <ListItemText primary="一覧" />
          </ListItemButton>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/staff/create")}>
            <ListItemText primary="新規" />
          </ListItemButton>
        </List>
      </Collapse>

      {/* Logs (submenu) */}
      <ListItemButton onClick={() => toggle('logs')} sx={{ py: 1.2 }}>
        <ListItemIcon><SummarizeIcon /></ListItemIcon>
        <ListItemText primary="通知ログ照会" />
        {open.logs ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open.logs} timeout="auto" unmountOnExit>
        <List disablePadding>
          <ListItemButton sx={{ pl: 6, py: 1.05 }} onClick={() => customNavigate("/logs/list")}>
            <ListItemText primary="一覧" />
          </ListItemButton>
          
        </List>
      </Collapse>
    </>
  )}
  
  {/* Settings (single) — keep as-is, or make a submenu the same way */}
  {/* <ListItemButton onClick={() => navigate("/settings")} sx={{ py: 1.2 }}>
    <ListItemIcon><SettingsIcon /></ListItemIcon>
    <ListItemText primary="設定" />
  </ListItemButton> */}
</List>

          <Box sx={{ flex: 1 }} />
          <Divider />

          {/* Auth */}
          <List sx={{ py: 0 }}>
            <ListItemButton onClick={handleAuthClick} sx={{ py: 1.2 }}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary={!user ? "ログイン" : "ログアウト"} />
            </ListItemButton>
          </List>
        </>
      );
    })()}
  </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Fixed AppBar */}
    

      {/* Permanent drawer that shares width with content; never overlays */}
      {window.location.pathname !== "/login" && (
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: {
              whiteSpace: "nowrap",
              overflowX: "hidden",
              width: sidebarWidth,
              transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
              borderRight: (t) => `1px solid ${t.palette.divider}`,
              boxSizing: "border-box",
              // Hide text labels when drawer is closed
              '& .MuiListItemText-root': {
                opacity: drawerOpen ? 1 : 0,
                transition: (t) => t.transitions.create("opacity", { duration: t.transitions.duration.shorter }),
              },
              // Hide collapse sections when drawer is closed
              '& .MuiCollapse-root': {
                display: drawerOpen ? 'block' : 'none',
              },
              // Hide expand/collapse icons (ExpandMore/ExpandLess) when drawer is closed
              '& .MuiListItemButton-root > .MuiSvgIcon-root:last-child': {
                opacity: drawerOpen ? 1 : 0,
                transition: (t) => t.transitions.create("opacity", { duration: t.transitions.duration.shorter }),
              }
            },
          }}
          open // keep mounted
        >
          {/* Open/close sidebar */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: drawerOpen ? 'flex-end' : 'center',
          }}>
            <IconButton 
              onClick={handleDrawerToggle}
              sx={{
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-visible': {
                  outline: 'none',
                }
              }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Box>
          {DrawerContent}
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: sidebarWidth,       // share width with drawer
          transition: (t) => t.transitions.create("margin-left", { duration: t.transitions.duration.shorter }),
        }}
      >
        {/* This Toolbar spacer pushes content below the AppBar height */}
        {/* <Toolbar /> */}
        <Box sx={window.location.pathname !== "/login" ? {} : {}}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
