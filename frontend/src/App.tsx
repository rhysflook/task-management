import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Projects from "./pages/Projects.tsx";
import MainLayout from "./features/main/MainLayout.tsx";
import ProjectDashboard from "./pages/projects/ProjectDashboard.tsx";
import CreateProject from "./pages/projects/CreateProject.tsx";
import EditProject from "./pages/projects/EditProject.tsx";
import Registration from "./pages/auth/Registration.tsx";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap.tsx";
import { GuestRoute, UserRoute } from "./components/auth/routeGuards.tsx";
import Login from "./pages/auth/Login.tsx";

const App = () => {
  useAuthBootstrap();
  return (
    <Router>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/register" element={<GuestRoute><Registration /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/" element={<UserRoute><Home /></UserRoute>} />
        <Route path="/projects" element={<UserRoute><Projects /></UserRoute>} />
        <Route path="/projects/create" element={<UserRoute><CreateProject /></UserRoute>} />
        <Route path="/projects/:id" element={<UserRoute><ProjectDashboard /></UserRoute>} />
        <Route path="/projects/:id/edit" element={<UserRoute><EditProject /></UserRoute>} />
      </Route>
      </Routes>
    </Router>
  );
};

export default App;