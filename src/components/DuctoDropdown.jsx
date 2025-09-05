import { useEffect, useState } from "react";

export default function DuctoDropdown({ ductos, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  // Efecto para cerrar el menú cuando la selección cambia externamente
  useEffect(() => {
    // Solo cierra el menú si ya estaba abierto y la selección es válida
    if (isOpen && selected) {
      setIsOpen(false);
    }
  }, [selected]); // Escucha solo los cambios en la prop 'selected'

  const selectedOption = ductos.find((d) => d.TB_DuctoID === selected);

  return (
    <div className="mb-4 font-sans">
      <label className="block text-gray-700 font-medium mb-1">Selecciona un ducto</label>
      <div className="relative relative w-[17rem] lg:w-[22.5rem]">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer flex justify-between items-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition duration-200"
        >
          {selectedOption ? selectedOption.DuctoName : "Todos los ductos"}
          <svg
            className={`w-4 h-4 ml-2 transition-transform duration-200 transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer transition duration-150 ease-in-out ${
                !selected ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-gray-100"
              }`}
            >
              Todos los ductos
            </div>
            {ductos.map((d) => (
              <div
                key={d.TB_DuctoID}
                onClick={() => {
                  onSelect(d.TB_DuctoID);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer transition duration-150 ease-in-out ${
                  selected === d.TB_DuctoID ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-gray-100"
                }`}
              >
                {d.DuctoName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}