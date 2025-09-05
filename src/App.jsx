import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DuctoTramoSelect from "./pages/DuctoTramoSelect";
import Matriz from "./components/Matriz";
import Heatmap from "./pages/Heatmap";
import PigTrap from "./pages/PigTrap";
import CalculoPigTrap from "./components/CalculoPigTrap";
import CalculoCracking from "./components/CalculoCracking";
import Cracking from "./pages/Cracking";
import ExternalCorrosion from "./pages/ExternalCorrosion";
import CalculoExternalCorrosion from "./components/CalculoExternalCorrosion";
import IncorrectOperations from "./pages/IncorrectOperations";  
import CalculoIncorrectOperations from "./components/CalculoIncorrectOperations";
import InternalCorrosion from "./pages/InternalCorrosion";
import CalculoInternalCorrosion from "./components/CalculoInternalCorrosion";
import MechanicalDamageDetonations from "./pages/MechanicaDamagDetonations";
import CalculoMechanicalDamageDetonations from "./components/CalculoMechanicalDamageDetonations";
import MechanicalDamageExcavation from "./pages/MechanicaDamagDetonations";
import CalculoMechanicalDamageExcavation from "./components/CalculoMechanicalDamageDetonations";
import CalculoMechanicalDamageImpact from "./components/CalculoMechanicalDamageImpact";
import MechanicalDamageImpact from "./pages/MechanicalDamageImpact";
import CalculoVandalismTheft from "./components/CalculoVandalismTheft";
import VandalismTheft from "./pages/VandalismTheft";



export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DuctoTramoSelect />} />
        <Route path="/matriz" element={<Matriz />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/pigtrap" element={<PigTrap />} />
        <Route path="/calculopigtrap" element={<CalculoPigTrap />} />
        <Route path="/calculocracking" element={<CalculoCracking />} />
        <Route path="/cracking" element={<Cracking />} />
        <Route path="/calculoexternalcorrosion" element={<CalculoExternalCorrosion />} />
        <Route path="/externalcorrosion" element={<ExternalCorrosion />} />
        <Route path="/calculoincorrectoperations" element={<CalculoIncorrectOperations />} />
        <Route path="/incorrectoperations" element={<IncorrectOperations />} />
        <Route path="/calculointernalcorrosion" element={<CalculoInternalCorrosion />} />
        <Route path="/internalcorrosion" element={<InternalCorrosion />} />
        <Route path="/calculomechanicaldamagedetonations" element={<CalculoMechanicalDamageDetonations />} />
        <Route path="/mechanicaldamagedetonations" element={<MechanicalDamageDetonations />} />
        <Route path="/calculomechanicaldamageexcavation" element={<CalculoMechanicalDamageExcavation />} />
        <Route path="/mechanicaldamageexcavation" element={<MechanicalDamageExcavation />} />
        <Route path="/calculomechanicaldamageimpact" element={<CalculoMechanicalDamageImpact />} />
        <Route path="/mechanicaldamageimpact" element={<MechanicalDamageImpact />} />
        <Route path="/calculovandalismtheft" element={<CalculoVandalismTheft />} />
        <Route path="/vandalismtheft" element={<VandalismTheft />} />

      </Routes>
    </Router>
  );
}
