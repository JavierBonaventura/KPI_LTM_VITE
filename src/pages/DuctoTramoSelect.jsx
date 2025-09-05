// src/pages/DuctoTramoSelect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes de selección
import DuctoDropdown from "../components/DuctoDropdown";
import TramoDropdown from "../components/TramoDropdown";
import RiesgoDropdown from "../components/RiesgoDropdown";
import Loader from "../components/Loader";

// Servicios de API
import { getPipelines, getTramos, getCof, getFof, getCracking, getPigTrap, getExternalCorrosion, getIncorrectOperations, getInternalCorrosion, getMechanicalDamageDetonations, getMechanicalDamageExcavation, getMechanicalDamageImpact, getVandalismTheft } from "../services/api";

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
  const ANALYSIS_CONFIG = {
    matriz: {
      fetchFunctions: [getCof, getFof],
      route: "/matriz",
      buttonText: "Generar Matriz",
      stateMapper: (results) => ({ resultadoCof: results[0], resultadoFof: results[1] }),
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
    },
    cracking: {
      fetchFunctions: [getCracking],
      route: "/calculocracking",
      buttonText: "Análisis Cracking",
      stateMapper: (results) => results[0],
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      color: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
    },
    pigtrap: {
      fetchFunctions: [getPigTrap],
      route: "/calculopigtrap",
      buttonText: "Análisis PigTrap",
      stateMapper: (results) => results[0],
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      color: "from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
    },
    externalcorrosion: {
      fetchFunctions: [getExternalCorrosion],
      route: "/calculoexternalcorrosion",
      buttonText: "Corrosión Externa",
      stateMapper: (results) => results[0],
      icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
    },
    incorrectoperations: {
      fetchFunctions: [getIncorrectOperations],
      route: "/calculoincorrectoperations",
      buttonText: "Operaciones Incorrectas",
      stateMapper: (results) => results[0],
      icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
    },
    internalcorrosion: {
      fetchFunctions: [getInternalCorrosion],
      route: "/calculointernalcorrosion",
      buttonText: "Corrosión Interna",
      stateMapper: (results) => results[0],
      icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      color: "from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
    },
    mechanicaldamagedetonations: {
      fetchFunctions: [getMechanicalDamageDetonations],
      route: "/calculomechanicaldamagedetonations",
      buttonText: "Daño Mecánico Detonaciones",
      stateMapper: (results) => results[0],
      icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
      color: "from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
    },
    mechanicaldamageexcavation: {
      fetchFunctions: [getMechanicalDamageExcavation],
      route: "/calculomechanicaldamageexcavation",
      buttonText: "Daño Mecánico Excavación",
      stateMapper: (results) => results[0],
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h16a8.014 8.014 0 00-.572-5.572z",
      color: "from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
    },
    mechanicaldamageimpact: {
      fetchFunctions: [getMechanicalDamageImpact],
      route: "/calculomechanicaldamageimpact",
      buttonText: "Daño Mecánico Impact",
      stateMapper: (results) => results[0],
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h16a8.014 8.014 0 00-.572-5.572z",
      color: "from-lime-600 to-lime-700 hover:from-lime-700 hover:to-lime-800"
    },
    vandalismtheft: {
      fetchFunctions: [getVandalismTheft],
      route: "/calculovandalismtheft",
      buttonText: "Vandalismo y Robo",
      stateMapper: (results) => results[0],
      icon: "M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-1.447 1.894L15 18M5 10l-4.553-2.276A2 2 0 011 6.618v4.764a2 2 0 001.447 1.894L5 18m0-8v10a2 2 0 002 2h10a2 2 0 002-2V10m-14 0a2 2 0 012-2h10a2 2 0 012 2",
      color: "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
    }

  };

  // --- Efectos ---
  useEffect(() => {
    getPipelines().then(setDuctos);
    getTramos().then((data) => {
      const sorted = [...data].sort((a, b) => a.TramoName.localeCompare(b.TramoName));
      setTramos(sorted);
    });
  }, []);

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

    const params = {
      analysisId: selectedRiesgo,
      pipelineId: ductos.find((d) => d.TB_DuctoID === selectedDucto)?.Pipeline,
      transmissionLineId: selectedTramo
        ? tramos.find((t) => t.TB_TramoID === selectedTramo)?.TransmissionLineID
        : undefined,
    };

    try {
      const { fetchFunctions, route } = ANALYSIS_CONFIG[analysisKey];

      if (analysisKey === 'matriz') {
        const resultadoCof = await getCof(params);
        const resultadoFof = await getFof(params);
        navigate("/matriz", { state: { resultadoCof, resultadoFof } });
      } else {
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

  // Obtener información del ducto y tramo seleccionados
  const selectedDuctoInfo = ductos.find(d => d.TB_DuctoID === selectedDucto);
  const selectedTramoInfo = tramos.find(t => t.TB_TramoID === selectedTramo);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Panel de Monitoreo de Riesgos
          </h1>
          <p className="mt-2 text-gray-500">
            Selecciona los parámetros para visualizar los análisis de riesgo del sistema de ductos
          </p>
        </div>

        {/* Dashboard de resumen */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl mb-8 border border-slate-700">
          {/* Header del dashboard */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${selectedRiesgo && selectedDucto ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></div>
              <h2 className="text-xl font-bold text-white">Estado de Consulta</h2>
            </div>
            <div className="text-sm text-slate-300">
              {new Date().toLocaleString('es-ES')}
            </div>
          </div>

          {/* Estado de selección */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedDuctoInfo ? selectedDuctoInfo.Pipeline : "Sistema de Ductos"}
            </h3>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full"></div>
            {selectedTramoInfo && (
              <p className="text-slate-300 mt-2">Tramo: {selectedTramoInfo.TramoName}</p>
            )}
          </div>

          {/* Métricas de estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Análisis de Riesgo */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className={`w-2 h-2 rounded-full ${selectedRiesgo ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              <div className="text-xl font-bold text-white">
                {selectedRiesgo ? "Seleccionado" : "Pendiente"}
              </div>
              <div className="text-sm text-slate-400">Análisis de Riesgo</div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${selectedRiesgo ? 'bg-green-400 w-full' : 'bg-gray-400 w-1/3'}`}></div>
              </div>
            </div>

            {/* Ducto */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className={`w-2 h-2 rounded-full ${selectedDucto ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              </div>
              <div className="text-xl font-bold text-white">
                {ductos.length}
              </div>
              <div className="text-sm text-slate-400">
                {selectedDucto ? "Ducto Activo" : `Ductos Disponibles`}
              </div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${selectedDucto ? 'bg-purple-400 w-full' : 'bg-gray-400 w-2/3'}`}></div>
              </div>
            </div>

            {/* Tramo */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${selectedTramo ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                  <span className={`text-xs font-medium ${selectedTramo ? 'text-green-400' : 'text-amber-400'}`}>
                    {selectedTramo ? 'ACTIVO' : 'OPCIONAL'}
                  </span>
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                {tramos.length}
              </div>
              <div className="text-sm text-slate-400">
                {selectedTramo ? "Tramo Específico" : "Tramos Disponibles"}
              </div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-300 ${selectedTramo ? 'bg-green-400 animate-pulse w-full' : 'bg-amber-400 w-4/5'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de selección */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-green-500 mr-4"></div>
            <h3 className="text-2xl font-semibold text-gray-700">Configuración de Parámetros</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Análisis de Riesgo *
              </label>
              <RiesgoDropdown selected={selectedRiesgo} onSelect={setSelectedRiesgo} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Ducto *
              </label>
              <DuctoDropdown
                ductos={ductos}
                selected={selectedDucto}
                onSelect={setSelectedDucto}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Tramo (Opcional)
              </label>
              <TramoDropdown
                tramos={tramos}
                selected={selectedTramo}
                onSelect={setSelectedTramo}
              />
            </div>
          </div>
        </div>

        {/* Panel de análisis disponibles */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 mr-4"></div>
              <h3 className="text-2xl font-semibold text-gray-700">Análisis Disponibles</h3>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${selectedRiesgo && selectedDucto ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{selectedRiesgo && selectedDucto ? 'Listo para análisis' : 'Configura parámetros'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(ANALYSIS_CONFIG).map(([key, { buttonText, icon, color }]) => (
              <button
                key={key}
                className={`group relative p-6 bg-gradient-to-br ${color} text-white font-semibold rounded-xl shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex flex-col items-center space-y-3 cursor-pointer`}
                onClick={() => handleConsultar(key)}
                disabled={!selectedRiesgo || !selectedDucto || isLoading}
              >
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <span className="text-sm text-center leading-tight">{buttonText}</span>
                
                {/* Indicador de estado */}
                <div className="absolute top-2 right-2">
                  {selectedRiesgo && selectedDucto && !isLoading && (
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Nota:</span> Los campos marcados con (*) son obligatorios. 
                El tramo es opcional y permite análisis más específicos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loader condicional */}
      {isLoading && <Loader />}
    </div>
  );
}