// src/pages/DuctoTramoSelect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Componentes de selección
import DuctoDropdown from "../components/DuctoDropdown";
import TramoDropdown from "../components/TramoDropdown";
import RiesgoDropdown from "../components/RiesgoDropdown";
import Loader from "../components/Loader";

// Servicios de API
import { getPipelines, getTramos, getCof, getFof, getCracking, getPigTrap, getExternalCorrosion, getIncorrectOperations, getInternalCorrosion, getMechanicalDamageDetonations, getMechanicalDamageExcavation, getMechanicalDamageImpact, getVandalismTheft, getWeatherOutsideForcesGeotech, getweatherOutsideForcesHydraulic, getweatherOutsideForcesWeather } from "../services/api";

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
      buttonText: "Matriz de Riesgo",
      stateMapper: (results) => ({ resultadoCof: results[0], resultadoFof: results[1] }),
      icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h8m0 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v10",
      category: "general"
    },
    cracking: {
      fetchFunctions: [getCracking],
      route: "/calculocracking",
      buttonText: "Análisis Cracking",
      stateMapper: (results) => results[0],
      icon: "M13 10V3L4 14h7v7l9-11h-7z",
      category: "structural"
    },
    pigtrap: {
      fetchFunctions: [getPigTrap],
      route: "/calculopigtrap",
      buttonText: "Análisis PigTrap",
      stateMapper: (results) => results[0],
      icon: "M9 3v2.01A5.99 5.99 0 003 11a5.99 5.99 0 006 6c3.31 0 6-2.69 6-6 0-3.31-2.69-6-6-6H7l2-2H9z",
      category: "operational"
    },
    externalcorrosion: {
      fetchFunctions: [getExternalCorrosion],
      route: "/calculoexternalcorrosion",
      buttonText: "Corrosión Externa",
      stateMapper: (results) => results[0],
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      category: "corrosion"
    },
    incorrectoperations: {
      fetchFunctions: [getIncorrectOperations],
      route: "/calculoincorrectoperations",
      buttonText: "Operaciones Incorrectas",
      stateMapper: (results) => results[0],
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      category: "operational"
    },
    internalcorrosion: {
      fetchFunctions: [getInternalCorrosion],
      route: "/calculointernalcorrosion",
      buttonText: "Corrosión Interna",
      stateMapper: (results) => results[0],
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      category: "corrosion"
    },
    mechanicaldamagedetonations: {
      fetchFunctions: [getMechanicalDamageDetonations],
      route: "/calculomechanicaldamagedetonations",
      buttonText: "Daño por Detonaciones",
      stateMapper: (results) => results[0],
      icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
      category: "mechanical"
    },
    mechanicaldamageexcavation: {
      fetchFunctions: [getMechanicalDamageExcavation],
      route: "/calculomechanicaldamageexcavation",
      buttonText: "Daño por Excavación",
      stateMapper: (results) => results[0],
      icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547A8.014 8.014 0 004 21h16a8.014 8.014 0 00-.572-5.572z",
      category: "mechanical"
    },
    mechanicaldamageimpact: {
      fetchFunctions: [getMechanicalDamageImpact],
      route: "/calculomechanicaldamageimpact",
      buttonText: "Daño por Impacto",
      stateMapper: (results) => results[0],
      icon: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v11a3 3 0 01-3 3H6a3 3 0 01-3-3V7a1 1 0 01-1-1V5a1 1 0 011-1h4z",
      category: "mechanical"
    },
    vandalismtheft: {
      fetchFunctions: [getVandalismTheft],
      route: "/calculovandalismtheft",
      buttonText: "Vandalismo y Robo",
      stateMapper: (results) => results[0],
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      category: "security"
    },
    weatherOutsideForcesGeotech: {
      fetchFunctions: [getWeatherOutsideForcesGeotech],
      route: "/calculoweatherOutsideForcesGeotech",
      buttonText: "Factores Geotécnicos",
      stateMapper: (results) => results[0],
      icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
      category: "environmental"
    },
    weatherOutsideForcesHydraulic: {
      fetchFunctions: [getweatherOutsideForcesHydraulic],
      route: "/calculoweatherOutsideForcesHydraulic",
      buttonText: "Factores Hidráulicos",
      stateMapper: (results) => results[0],
      icon: "M5 12l-2 0m2-5l-2 0m2 10l-2 0m13-10l2 0m-2 5l2 0m-2 5l2 0m-6-15l0-2m5 2l0 2m-10 0l0 2m5 15l0 2",
      category: "environmental"
    },
    weatherOutsideForcesWeather: {
      fetchFunctions: [getweatherOutsideForcesWeather],
      route: "/calculoweatherOutsideForcesWeather",
      buttonText: "Factores Climáticos",
      stateMapper: (results) => results[0],
      icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
      category: "environmental"
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

  // Agrupar análisis por categoría
  const categories = {
    general: { title: "Análisis General", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    structural: { title: "Análisis Estructural", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    operational: { title: "Análisis Operacional", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    corrosion: { title: "Análisis de Corrosión", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    mechanical: { title: "Daño Mecánico", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    security: { title: "Seguridad", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
    environmental: { title: "Factores Ambientales", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Panel de Monitoreo de Riesgos
          </h1>
          <p className="mt-2 text-gray-500">
            Selecciona los parámetros para visualizar los análisis de riesgo del sistema de ductos
          </p>
        </div>

        {/* Panel de configuración */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Configuración de Análisis</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Análisis de Riesgo
                </label>
                <RiesgoDropdown selected={selectedRiesgo} onSelect={setSelectedRiesgo} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ducto
                </label>
                <DuctoDropdown
                  ductos={ductos}
                  selected={selectedDucto}
                  onSelect={setSelectedDucto}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tramo (Opcional)
                </label>
                <TramoDropdown
                  tramos={tramos}
                  selected={selectedTramo}
                  onSelect={setSelectedTramo}
                />
              </div>
            </div>

            {/* Estado de la selección */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    selectedRiesgo && selectedDucto ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">
                    {selectedDuctoInfo ? selectedDuctoInfo.DuctoName : "Selecciona ducto"}
                    {selectedTramoInfo && ` - ${selectedTramoInfo.TramoName}`}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedRiesgo && selectedDucto 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedRiesgo && selectedDucto ? 'Listo' : 'Configurando'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis disponibles organizados por categoría */}
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryItems = Object.entries(ANALYSIS_CONFIG).filter(
            ([, config]) => config.category === categoryKey
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={categoryKey} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 ">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={categoryInfo.icon} />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">{categoryInfo.title}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {categoryItems.length}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryItems.map(([key, config]) => (
                    <button
                      key={key}
                      className={`group relative p-4 border rounded-lg text-left transition-all duration-200 ${
                        selectedRiesgo && selectedDucto && !isLoading
                          ? 'border-gray-300 hover:border-blue-500 hover:shadow-md bg-white hover:bg-blue-50 cursor-pointer'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      onClick={() => handleConsultar(key)}
                      disabled={!selectedRiesgo || !selectedDucto || isLoading}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedRiesgo && selectedDucto && !isLoading
                            ? 'bg-gray-100 group-hover:bg-blue-100'
                            : 'bg-gray-200'
                        }`}>
                          <svg className={`w-5 h-5 ${
                            selectedRiesgo && selectedDucto && !isLoading
                              ? 'text-gray-600 group-hover:text-blue-600'
                              : 'text-gray-400'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            selectedRiesgo && selectedDucto && !isLoading
                              ? 'text-gray-900 group-hover:text-blue-900'
                              : 'text-gray-500'
                          }`}>
                            {config.buttonText}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Indicador de estado */}
                      {selectedRiesgo && selectedDucto && !isLoading && (
                        <div className="absolute top-3 right-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Información */}
        <div className="rounded-lg p-4 border border-green-200" style={{background: 'linear-gradient(to top, rgba(38, 92, 79, 0.1), rgba(22, 54, 46, 0.05))'}}>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-900">Información</h4>
              <p className="text-sm text-green-800 mt-1">
                Selecciona un tipo de análisis de riesgo y un ducto para habilitar las opciones de análisis. 
                El tramo es opcional para análisis más específicos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loader */}
      {isLoading && <Loader />}
    </div>
  );
}