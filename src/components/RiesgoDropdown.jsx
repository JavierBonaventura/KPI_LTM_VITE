import { useEffect, useState } from "react";
import { getRiskAnalysis } from "../services/api";

export default function RiesgoDropdown({ selected, onSelect }) {
  const [riesgos, setRiesgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar la visibilidad

  useEffect(() => {
    getRiskAnalysis()
      .then((data) => {
        setRiesgos(data);
        if (!selected && data.length > 0) {
          onSelect(data[0].AnalysisId);
        }
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [onSelect, selected]);

  const selectedOption = riesgos.find(r => r.AnalysisId === selected);

  if (error) {
    return <div className="text-red-500 p-4 bg-red-100 rounded-lg">Error al cargar riesgos: {error.message}</div>;
  }
  
  if (loading) {
    return <div className="text-gray-500 p-4">Cargando análisis de riesgo...</div>;
  }
  
  if (!riesgos.length) {
    return <div className="text-gray-500 p-4 bg-gray-100 rounded-lg">No se encontraron análisis de riesgo</div>;
  }

  return (
    <div className="mb-4 font-sans">
      <label className="block text-gray-700 font-medium mb-1">Análisis de Riesgo</label>
      <div className="relative relative w-[17rem] lg:w-[22.5rem]">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-[17rem] lg:w-[22.5rem] p-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer flex justify-between items-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition duration-200"
        >
          {selectedOption ? selectedOption.nombre : "Selecciona un análisis..."}
          <svg className={`w-4 h-4 ml-2 transition-transform duration-200 transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-10 relative w-[17rem] lg:w-[22.5rem] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {riesgos.map((r) => (
              <div
                key={r.AnalysisId}
                onClick={() => {
                  onSelect(r.AnalysisId);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer transition duration-150 ease-in-out ${
                  selected === r.AnalysisId ? 'bg-blue-100 font-semibold text-blue-800' : 'hover:bg-gray-100'
                }`}
              >
                {r.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}