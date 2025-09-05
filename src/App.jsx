import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DuctoTramoSelect from "./pages/DuctoTramoSelect";
import Matriz from "./components/Matriz";
import Heatmap from "./pages/Heatmap";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DuctoTramoSelect />} />
        <Route path="/matriz" element={<Matriz />} />
         <Route path="/heatmap" element={<Heatmap />} />
      </Routes>
    </Router>
  );
}
