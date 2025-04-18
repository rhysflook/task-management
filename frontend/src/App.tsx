import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Projects from "./pages/Projects.tsx";
import MainLayout from "./features/main/MainLayout.tsx";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
      </Route>
      </Routes>
    </Router>
  );
};

export default App;