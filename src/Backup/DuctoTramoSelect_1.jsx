// src/views/DuctoTramoSelect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes de selección
import DuctoDropdown from "../components/DuctoDropdown";
import TramoDropdown from "../components/TramoDropdown";
import RiesgoDropdown from "../components/RiesgoDropdown";
import Loader from "../components/Loader"; // <-- Importa el nuevo componente

// Servicios de API
import { getPipelines, getTramos, getCof, getFof } from "../services/api";

export default function DuctoTramoSelect() {
  const navigate = useNavigate();

  // --- Estados principales ---
  const [ductos, setDuctos] = useState([]);
  const [tramos, setTramos] = useState([]);
  const [selectedDucto, setSelectedDucto] = useState("");
  const [selectedTramo, setSelectedTramo] = useState("");
  const [selectedRiesgo, setSelectedRiesgo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Efecto: cargar ductos y tramos al inicio ---
  useEffect(() => {
    getPipelines().then(setDuctos);
    getTramos().then((data) => {
      const sorted = [...data].sort((a, b) => a.TramoName.localeCompare(b.TramoName));
      setTramos(sorted);
    });
  }, []);

  // --- Efecto: filtrar tramos al seleccionar ducto ---
  useEffect(() => {
    if (!selectedDucto) {
      getTramos().then((data) => {
        const sorted = [...data].sort((a, b) => a.TramoName.localeCompare(b.TramoName));
        setTramos(sorted);
      });
      setSelectedTramo("");
      return;
    }

    getTramos(selectedDucto).then((data) => {
      const sorted = [...data].sort((a, b) => a.TramoName.localeCompare(b.TramoName));
      setTramos(sorted);
    });
  }, [selectedDucto]);

  // --- Efecto: seleccionar automáticamente ducto al elegir tramo ---
  useEffect(() => {
    if (!selectedTramo) return;

    const tramo = tramos.find((t) => t.TB_TramoID === selectedTramo);
    if (tramo) {
      setSelectedDucto(tramo.TB_DuctoID);
    }
  }, [selectedTramo, tramos]);

  // --- Acción: manejar botón "Consultar" ---
  const handleConsultar = async () => {
    if (!selectedRiesgo || !selectedDucto) {
      alert("Selecciona un análisis de riesgo y un ducto.");
      return;
    }

    setIsLoading(true);

    const params = {
      analysisId: selectedRiesgo,
      pipelineId: ductos.find((d) => d.TB_DuctoID === selectedDucto)?.Pipeline,
      transmissionLineId: selectedTramo
        ? tramos.find((t) => t.TB_TramoID === selectedTramo)?.TransmissionLineID
        : undefined,
    };

    try {
      const resultadoCof = await getCof(params);
      const resultadoFof = await getFof(params);

      navigate("/matriz", { state: { resultadoCof, resultadoFof } });
    } catch (err) {
      console.error("Error al consultar COF/FoF:", err);
      alert("Error al consultar COF/FoF");
        setIsLoading(false)
    } 
  };

  // --- Render ---
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Panel de Monitoreo de Riesgos
          </h1>
          <p className="mt-2 text-gray-500">
            Selecciona los parámetros para visualizar los análisis de riesgo.
          </p>
        </div>

        {/* Contenedor de selects */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RiesgoDropdown selected={selectedRiesgo} onSelect={setSelectedRiesgo} />
            <DuctoDropdown
              ductos={ductos}
              selected={selectedDucto}
              onSelect={setSelectedDucto}
            />
            <TramoDropdown
              tramos={tramos}
              selected={selectedTramo}
              onSelect={setSelectedTramo}
            />
          </div>
        </div>

        {/* Contenedor del botón */}
        <div className="mt-8 text-center">
          <button
            className="px-8 py-3 bg-gradient-to-r from-[#276334] to-green-800 text-white font-bold rounded-lg shadow-md hover:from-green-800 hover:to-[#276334] transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            onClick={handleConsultar}
            disabled={!selectedRiesgo || !selectedDucto || isLoading}
          >
            {isLoading ? "Consultando..." : "Generar Matriz"}
          </button>
        </div>
      </div>

      {/* Llama al componente Loader de forma condicional */}
      {isLoading && <Loader />}
    </div>
  );
}




