import { useEffect, useState } from "react";

export default function TramoDropdown({ tramos, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  // Efecto para cerrar el menú cuando la selección cambia externamente
  useEffect(() => {
    // Solo cierra el menú si ya estaba abierto y la selección es válida
    if (isOpen && selected) {
      setIsOpen(false);
    }
  }, [selected]); // Escucha solo los cambios en la prop 'selected'

  const selectedOption = tramos.find((t) => t.TB_TramoID === selected);

  return (
    <div className="mb-4 font-sans">
      <label className="block text-gray-700 font-medium mb-1">Selecciona un tramo</label>
      <div className="relative relative w-[17rem] lg:w-[22.5rem]">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer flex justify-between items-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500 transition duration-200"
        >
          {selectedOption ? selectedOption.TramoName : "Todos los tramos"}
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
              Todos los tramos
            </div>
            {tramos.map((t) => (
              <div
                key={t.TB_TramoID}
                onClick={() => {
                  onSelect(t.TB_TramoID);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer transition duration-150 ease-in-out ${
                  selected === t.TB_TramoID ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-gray-100"
                }`}
              >
                {t.TramoName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}