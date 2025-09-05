// src/pages/DuctoTramoSelect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes de selección
import DuctoDropdown from "../components/DuctoDropdown";
import TramoDropdown from "../components/TramoDropdown";
import RiesgoDropdown from "../components/RiesgoDropdown";
import Loader from "../components/Loader";

// Servicios de API
import { getPipelines, getTramos, getCof, getFof, getCracking, getPigTrap, getExternalCorrosion, getIncorrectOperations, getInternalCorrosion, getMechanicalDamageDetonations, getMechanicalDamageExcavation } from "../services/api";

export default function DuctoTramoSelect() {
  const navigate = useNavigate();

  // --- Estados principales ---
  const [ductos, setDuctos] = useState([]);
  const [tramos, setTramos] = useState([]);
  const [selectedDucto, setSelectedDucto] = useState("");
  const [selectedTramo, setSelectedTramo] = useState("");
  const [selectedRiesgo, setSelectedRiesgo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- Configuración de análisis ---
  // Cada key define qué funciones de API llamar, a qué ruta navegar y cómo mapear los datos
  const ANALYSIS_CONFIG = {
    matriz: {
      fetchFunctions: [getCof, getFof],
      route: "/matriz",
      buttonText: "Generar Matriz",
      stateMapper: (results) => ({ resultadoCof: results[0], resultadoFof: results[1] })
    },
    cracking: {
      fetchFunctions: [getCracking],
      route: "/calculocracking",
      buttonText: "Generar Cracking",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    pigtrap: {
      fetchFunctions: [getPigTrap],
      route: "/calculopigtrap",
      buttonText: "Generar PigTrap",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    externalcorrosion: {
      fetchFunctions: [getExternalCorrosion],
      route: "/calculoexternalcorrosion",
      buttonText: "Generar External Corrosion",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    incorrectoperations: {
      fetchFunctions: [getIncorrectOperations],
      route: "/calculoincorrectoperations",
      buttonText: "Generar Incorrect Operations",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    internalcorrosion: {
      fetchFunctions: [getInternalCorrosion],
      route: "/calculointernalcorrosion",
      buttonText: "Generar Internal Corrosion",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    mechanicaldamagedetonations: {
      fetchFunctions: [getMechanicalDamageDetonations],
      route: "/calculomechanicaldamagedetonations",
      buttonText: "Generar Mechanical Damage Detonations",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    },
    mechanicaldamageexcavation: {
      fetchFunctions: [getMechanicalDamageExcavation],
      route: "/calculomechanicaldamageexcavation",
      buttonText: "Generar Mechanical Damage Excavation",
      stateMapper: (results) => results[0] // Solo un resultado, tomar el primero
    }

  };

  // --- Efecto: cargar ductos y tramos al inicio ---
  useEffect(() => {
    getPipelines().then(setDuctos);

    getTramos().then((data) => {
      const sorted = [...data].sort((a, b) => a.TramoName.localeCompare(b.TramoName));
      setTramos(sorted);
    });
  }, []);

  // --- Efecto: filtrar tramos cuando se selecciona un ducto ---
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

  // --- Función genérica para manejar cualquier consulta ---
  const handleConsultar = async (analysisKey) => {
    if (!selectedRiesgo || !selectedDucto) {
      alert("Selecciona un análisis de riesgo y un ducto.");
      return;
    }

    setIsLoading(true);

    // Preparar parámetros comunes para todas las APIs
    const params = {
      analysisId: selectedRiesgo,
      pipelineId: ductos.find((d) => d.TB_DuctoID === selectedDucto)?.Pipeline,
      transmissionLineId: selectedTramo
        ? tramos.find((t) => t.TB_TramoID === selectedTramo)?.TransmissionLineID
        : undefined,
    };

    try {
      const { fetchFunctions, route } = ANALYSIS_CONFIG[analysisKey];

      // Caso especial para matriz: usar la lógica original exacta
      if (analysisKey === 'matriz') {
        const resultadoCof = await getCof(params);
        const resultadoFof = await getFof(params);
        navigate("/matriz", { state: { resultadoCof, resultadoFof } });
      } else {
        // Para otros análisis, usar Promise.all como antes
        const results = await Promise.all(fetchFunctions.map((fn) => fn(params)));
        navigate(route, { state: results });
      }
    } catch (err) {
      console.error(`Error al consultar ${analysisKey}:`, err);
      alert(`Error al consultar ${analysisKey}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderizado del componente ---
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Título y descripción */}
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

        {/* Contenedor de botones */}
<div className="mt-8 flex justify-center items-center gap-4 flex-wrap">          {Object.entries(ANALYSIS_CONFIG).map(([key, { buttonText }]) => (
            <button
              key={key}
              className="px-6 py-3 bg-gradient-to-r from-[#276334] to-green-800 text-white font-bold rounded-lg shadow-md hover:from-green-800 hover:to-[#276334] transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => handleConsultar(key)}
              disabled={!selectedRiesgo || !selectedDucto || isLoading}
            >
              {isLoading ? buttonText : buttonText}
            </button>
          ))}
        </div>
      </div>

      {/* Loader condicional */}
      {isLoading && <Loader />}
    </div>
  );
}