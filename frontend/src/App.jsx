import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./features/main/MainLayout.jsx";
import Registration from "./pages/auth/Registration.jsx";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap.jsx";
import { GuestRoute, UserRoute } from "./components/auth/routeGuards.jsx";
import Login from "./pages/auth/Login.jsx";
import { FeatureContext } from "./context/FeatureContext";

import ExampleDashboard from "./pages/examples/ExampleDashboard";
import CreateExample from "./pages/examples/CreateExample";
import EditExample from "./pages/examples/EditExample";
import ListExamples from "./pages/examples/ListExamples";

import UnitMapDashboard from "./pages/unitMaps/UnitMapDashboard";
import CreateUnitMap from "./pages/unitMaps/CreateUnitMap";
import EditUnitMap from "./pages/unitMaps/EditUnitMap";
import ListUnitMaps from "./pages/unitMaps/ListUnitMaps";

import PatientDashboard from "./pages/patients/PatientDashboard";
import CreatePatient from "./pages/patients/CreatePatient";
import EditPatient from "./pages/patients/EditPatient";
import ListPatients from "./pages/patients/ListPatients";

import LogDashboard from "./pages/logs/LogDashboard";
import CreateLog from "./pages/logs/CreateLog";
import EditLog from "./pages/logs/EditLog";
import ListLogs from "./pages/logs/ListLogs";

import UnitDashboard from "./pages/units/UnitDashboard";
import CreateUnit from "./pages/units/CreateUnit";
import EditUnit from "./pages/units/EditUnit";
import ListUnits from "./pages/units/ListUnits";

import RoomDashboard from "./pages/rooms/RoomDashboard";
import CreateRoom from "./pages/rooms/CreateRoom";
import EditRoom from "./pages/rooms/EditRoom";
import ListRooms from "./pages/rooms/ListRooms";

import ServerDashboard from "./pages/server/ServerDashboard";
import CreateServer from "./pages/server/CreateServer";
import EditServer from "./pages/server/EditServer";
import ListServers from "./pages/server/ListServers";

import StaffDashboard from "./pages/staff/StaffDashboard";
import CreateStaff from "./pages/staff/CreateStaff";
import EditStaff from "./pages/staff/EditStaff";
import ListStaffs from "./pages/staff/ListStaffs";

import BedDashboard from "./pages/beds/BedDashboard";
import CreateBed from "./pages/beds/CreateBed";
import EditBed from "./pages/beds/EditBed";
import ListBeds from "./pages/beds/ListBeds";

import ExtensionDashboard from "./pages/extensions/ExtensionDashboard";
import CreateExtension from "./pages/extensions/CreateExtension";
import EditExtension from "./pages/extensions/EditExtension";
import ListExtensions from "./pages/extensions/ListExtensions";

import ClientDashboard from "./pages/clients/ClientDashboard";
import CreateClient from "./pages/clients/CreateClient";
import EditClient from "./pages/clients/EditClient";
import ListClients from "./pages/clients/ListClients";

import RingGroupDashboard from "./pages/ringGroups/RingGroupDashboard";
import CreateRingGroup from "./pages/ringGroups/CreateRingGroup";
import EditRingGroup from "./pages/ringGroups/EditRingGroup";
import ListRingGroups from "./pages/ringGroups/ListRingGroups";

import { configureEcho } from "@laravel/echo-react";

configureEcho({
    broadcaster: "reverb",
});

const App = () => {
  useAuthBootstrap();

  const RouteElementWrapper = (feature, element) => {
    return (
      <FeatureContext.Provider value={{ feature: feature }}>
        {element}
      </FeatureContext.Provider>
    )
  }

  return (
    <Router>
      <Routes>
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route element={<MainLayout />}>
          <Route index element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Registration /></GuestRoute>} />

          <Route path="/examples" element={RouteElementWrapper("examples", <UserRoute><ExampleDashboard /></UserRoute>)} />
          <Route path="/examples/list" element={RouteElementWrapper("examples", <UserRoute><ListExamples /></UserRoute>)} />
          <Route path="/examples/create" element={RouteElementWrapper("examples", <UserRoute><CreateExample /></UserRoute>)} />
          <Route path="/examples/:id/edit" element={RouteElementWrapper("examples", <UserRoute><EditExample /></UserRoute>)} />

          <Route path="/unitMaps" element={RouteElementWrapper("unitMaps", <UserRoute><UnitMapDashboard /></UserRoute>)} />
          <Route path="/unitMaps/list" element={RouteElementWrapper("unitMaps", <UserRoute><ListUnitMaps /></UserRoute>)} />
          <Route path="/unitMaps/create" element={RouteElementWrapper("unitMaps", <UserRoute><CreateUnitMap /></UserRoute>)} />
          <Route path="/unitMaps/:id/edit" element={RouteElementWrapper("unitMaps", <UserRoute><EditUnitMap /></UserRoute>)} />

          <Route path="/patients" element={RouteElementWrapper("patients", <UserRoute><PatientDashboard /></UserRoute>)} />
          <Route path="/patients/list" element={RouteElementWrapper("patients", <UserRoute><ListPatients /></UserRoute>)} />
          <Route path="/patients/create" element={RouteElementWrapper("patients", <UserRoute><CreatePatient /></UserRoute>)} />
          <Route path="/patients/:id/edit" element={RouteElementWrapper("patients", <UserRoute><EditPatient /></UserRoute>)} />
          <Route path="/logs" element={RouteElementWrapper("logs", <UserRoute><LogDashboard /></UserRoute>)} />
          <Route path="/logs/list" element={RouteElementWrapper("logs", <UserRoute><ListLogs /></UserRoute>)} />
          <Route path="/logs/create" element={RouteElementWrapper("logs", <UserRoute><CreateLog /></UserRoute>)} />
          <Route path="/logs/:id/edit" element={RouteElementWrapper("logs", <UserRoute><EditLog /></UserRoute>)} />
          <Route path="/units" element={RouteElementWrapper("units", <UserRoute><UnitDashboard /></UserRoute>)} />
          <Route path="/units/list" element={RouteElementWrapper("units", <UserRoute><ListUnits /></UserRoute>)} />
          <Route path="/units/create" element={RouteElementWrapper("units", <UserRoute><CreateUnit /></UserRoute>)} />
          <Route path="/units/:id/edit" element={RouteElementWrapper("units", <UserRoute><EditUnit /></UserRoute>)} />

          <Route path="/rooms" element={RouteElementWrapper("rooms", <UserRoute><RoomDashboard /></UserRoute>)} />
          <Route path="/rooms/list" element={RouteElementWrapper("rooms", <UserRoute><ListRooms /></UserRoute>)} />
          <Route path="/rooms/create" element={RouteElementWrapper("rooms", <UserRoute><CreateRoom /></UserRoute>)} />
          <Route path="/rooms/:id/edit" element={RouteElementWrapper("rooms", <UserRoute><EditRoom /></UserRoute>)} />

          <Route path="/servers" element={RouteElementWrapper("servers", <UserRoute><ServerDashboard /></UserRoute>)} />
          <Route path="/servers/list" element={RouteElementWrapper("servers", <UserRoute><ListServers /></UserRoute>)} />
          <Route path="/servers/create" element={RouteElementWrapper("servers", <UserRoute><CreateServer /></UserRoute>)} />
          <Route path="/servers/:id/edit" element={RouteElementWrapper("servers", <UserRoute><EditServer /></UserRoute>)} />
          <Route path="/staff" element={RouteElementWrapper("staff", <UserRoute><StaffDashboard /></UserRoute>)} />
          <Route path="/staff/list" element={RouteElementWrapper("staff", <UserRoute><ListStaffs /></UserRoute>)} />
          <Route path="/staff/create" element={RouteElementWrapper("staff", <UserRoute><CreateStaff /></UserRoute>)} />
          <Route path="/staff/:id/edit" element={RouteElementWrapper("staff", <UserRoute><EditStaff /></UserRoute>)} />
          <Route path="/beds" element={RouteElementWrapper("beds", <UserRoute><BedDashboard /></UserRoute>)} />
          <Route path="/beds/list" element={RouteElementWrapper("beds", <UserRoute><ListBeds /></UserRoute>)} />
          <Route path="/beds/create" element={RouteElementWrapper("beds", <UserRoute><CreateBed /></UserRoute>)} />
          <Route path="/beds/:id/edit" element={RouteElementWrapper("beds", <UserRoute><EditBed /></UserRoute>)} />
          <Route path="/extensions" element={RouteElementWrapper("extensions", <UserRoute><ExtensionDashboard /></UserRoute>)} />
          <Route path="/extensions/list" element={RouteElementWrapper("extensions", <UserRoute><ListExtensions /></UserRoute>)} />
          <Route path="/extensions/create" element={RouteElementWrapper("extensions", <UserRoute><CreateExtension /></UserRoute>)} />
          <Route path="/extensions/:id/edit" element={RouteElementWrapper("extensions", <UserRoute><EditExtension /></UserRoute>)} />
          <Route path="/clients" element={RouteElementWrapper("clients", <UserRoute><ClientDashboard /></UserRoute>)} />
          <Route path="/clients/list" element={RouteElementWrapper("clients", <UserRoute><ListClients /></UserRoute>)} />
          <Route path="/clients/create" element={RouteElementWrapper("clients", <UserRoute><CreateClient /></UserRoute>)} />
          <Route path="/clients/:id/edit" element={RouteElementWrapper("clients", <UserRoute><EditClient /></UserRoute>)} />
          <Route path="/ringGroups" element={RouteElementWrapper("ringGroups", <UserRoute><RingGroupDashboard /></UserRoute>)} />
          <Route path="/ringGroups/list" element={RouteElementWrapper("ringGroups", <UserRoute><ListRingGroups /></UserRoute>)} />
          <Route path="/ringGroups/create" element={RouteElementWrapper("ringGroups", <UserRoute><CreateRingGroup /></UserRoute>)} />
          <Route path="/ringGroups/:id/edit" element={RouteElementWrapper("ringGroups", <UserRoute><EditRingGroup /></UserRoute>)} />







</Route>
      </Routes>
    </Router>
  );
};

export default App;