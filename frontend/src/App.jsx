import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./features/main/MainLayout.jsx";
import Registration from "./pages/auth/Registration.jsx";
import { useAuthBootstrap } from "./hooks/useAuthBootstrap.jsx";
import { GuestRoute, UserRoute } from "./components/auth/routeGuards.jsx";
import Login from "./pages/auth/Login.jsx";
import ExampleDashboard from "./pages/examples/ExampleDashboard";
import CreateExample from "./pages/examples/CreateExample";
import EditExample from "./pages/examples/EditExample";
import ListExamples from "./pages/examples/ListExamples";
const App = () => {
  useAuthBootstrap();
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/register" element={<GuestRoute><Registration /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/examples" element={<UserRoute><ExampleDashboard /></UserRoute>} />
          <Route path="/examples/list" element={<UserRoute><ListExamples /></UserRoute>} />
          <Route path="/examples/create" element={<UserRoute><CreateExample /></UserRoute>} />
          <Route path="/examples/:id/edit" element={<UserRoute><EditExample /></UserRoute>} />

        </Route>
      </Routes>
    </Router>
  );
};

export default App;