import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DuctoTramoSelect from "./pages/DuctoTramoSelect";
import Matriz from "./components/Matriz";
import Heatmap from "./pages/Heatmap";
import PigTrap from "./pages/PigTrap";
import CalculoCracking from "./components/CalculoCracking";
import Cracking from "./pages/Cracking";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DuctoTramoSelect />} />
        <Route path="/matriz" element={<Matriz />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/pigtrap" element={<PigTrap />} />
        <Route path="/calculocracking" element={<CalculoCracking />} />
        <Route path="/cracking" element={<Cracking />} />
      </Routes>
    </Router>
  );
}
