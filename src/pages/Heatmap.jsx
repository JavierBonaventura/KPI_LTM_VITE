import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function RiskMatrixHeatmap() {
  const location = useLocation();

  // Recibimos los datos del state o arreglo vacío
  const receivedHeatmap = location.state?.heatmapConDetalle || [];

  // Normalizamos a 7x7 (49 elementos)
  const heatmapConDetalle = Array.from({ length: 7 }, (_, cofIndex) =>
    Array.from({ length: 7 }, (_, fofIndex) => {
      return (
        receivedHeatmap.find(
          (c) => c.cofIndex === cofIndex && c.fofIndex === fofIndex
        ) || {
          cofIndex,
          fofIndex,
          SegmentosCantidad: 0,
          Segmentos: [],
        }
      );
    })
  ).flat();

  const [selectedCell, setSelectedCell] = useState(null);

  // Configuración de la matriz
  const cofLabels = [
    { label: "Extreme", range: "(2e+9 - ∞)", color: "bg-red-700" },
    { label: "Critical", range: "(2e+8 - 2e+9)", color: "bg-red-500" },
    { label: "Severe", range: "(2e+6 - 2e+8)", color: "bg-yellow-400" },
    { label: "Serious", range: "(5e+5 - 2e+6)", color: "bg-yellow-300" },
    { label: "Moderate", range: "(4e+4 - 5e+5)", color: "bg-green-300" },
    { label: "Minor", range: "(4e+3 - 4e+4)", color: "bg-green-400" },
    { label: "Insignificant", range: "(-∞ - 4e+3)", color: "bg-green-500" },
  ];

  const fofLabels = [
    { label: "Almost Impossible", range: "(-∞ - 1e-5)" },
    { label: "Rare", range: "(1e-5 - 1e-4)" },
    { label: "Possible", range: "(1e-4 - 1e-3)" },
    { label: "Likely", range: "(1e-3 - 1e-2)" },
    { label: "Very Likely", range: "(1e-2 - 1e-1)" },
    { label: "Highly Likely", range: "(1e-1 - 1e+0)" },
    { label: "Almost Certain", range: "(1e+0 - ∞)" },
  ];

  const getCelda = (cofIndex, fofIndex) =>
    heatmapConDetalle.find(
      (c) => c.cofIndex === cofIndex && c.fofIndex === fofIndex
    );

  const getRiskColor = (rowIndex, colIndex) => {
    // Definimos las reglas por fila
    const rules = {
      0: [
        { max: 1, color: "bg-[#fd7e14]" }, // naranja
        { max: 3, color: "bg-[#dc3545]" }, // rojo
        { max: Infinity, color: "bg-[#b21f2d]" }, // rojo oscuro
      ],
      1: [
        { max: 0, color: "bg-[#ffc107]" }, // amarillo
        { max: 2, color: "bg-[#fd7e14]" }, // naranja
        { max: 4, color: "bg-[#dc3545]" }, // rojo
        { max: Infinity, color: "bg-[#b21f2d]" }, // rojo oscuro
      ],
      2: [
        { max: 1, color: "bg-[#ffc107]" }, // amarillo
        { max: 3, color: "bg-[#fd7e14]" }, // naranja
        { max: 5, color: "bg-[#dc3545]" }, // rojo
        { max: Infinity, color: "bg-[#b21f2d]" }, // rojo oscuro
      ],
      3: [
        { max: 2, color: "bg-[#ffc107]" }, // amarillo
        { max: 4, color: "bg-[#fd7e14]" }, // naranja
        { max: Infinity, color: "bg-[#dc3545]" }, // rojo
      ],
      4: [
        { max: 0, color: "bg-[#28a745]" }, // verde
        { max: 3, color: "bg-[#ffc107]" }, // amarillo
        { max: 5, color: "bg-[#fd7e14]" }, // naranja
        { max: Infinity, color: "bg-[#dc3545]" }, // rojo
      ],
      5: [
        { max: 1, color: "bg-[#28a745]" }, // verde
        { max: 4, color: "bg-[#ffc107]" }, // amarillo
        { max: Infinity, color: "bg-[#fd7e14]" }, // naranja
      ],
      6: [
        { max: 2, color: "bg-[#28a745]" }, // verde
        { max: 5, color: "bg-[#ffc107]" }, // amarillo
        { max: Infinity, color: "bg-[#fd7e14]" }, // naranja
      ],
    };

    const rowRules = rules[rowIndex];
    if (!rowRules) return "bg-gray-200"; // fallback

    // Encuentra el primer rango que cumple
    const rule = rowRules.find((r) => colIndex <= r.max);
    return rule ? rule.color : "bg-gray-200";
  };

  const handleCellClick = (cofIndex, fofIndex) => {
    const celda = getCelda(cofIndex, fofIndex);
    setSelectedCell(celda);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              CoF - FoF Risk Assessment Matrix
            </h1>
          </div>

          {/* Matriz Principal */}
          <div className="overflow-x-auto">
            <table className="border-collapse border-2 border-gray-400 shadow-lg w-full table-fixed">
              <thead>
                {/* Fila principal: CoF y FoF */}
                <tr>
                  <th className="bg-gray-100 border-2 border-gray-400 p-3 w-[120px]"></th>
                  <th
                    colSpan={fofLabels.length}
                    className="bg-gray-100 border-2 border-gray-400 p-3 text-center text-lg font-bold text-gray-700"
                  >
                    FoF
                  </th>
                </tr>

                {/* Fila de etiquetas FoF */}
                <tr>
                  <th className="bg-gray-100 border-2 border-gray-400 p-2 text-center text-lg font-bold text-gray-700">
                    CoF (US$)
                  </th>
                  {fofLabels.map((fof, idx) => (
                    <th
                      key={idx}
                      className="bg-blue-50 border-2 border-gray-400 p-2 w-1/7"
                    >
                      <div className="text-xs font-semibold text-center">
                        {fof.label}
                      </div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        {fof.range}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {cofLabels.map((cof, cofIdx) => (
                  <tr key={cofIdx}>
                    {/* Label de cada fila CoF */}
                    <td className="bg-blue-50 border-2 border-gray-400 p-3 w-[120px]">
                      <div className="text-xs font-semibold">{cof.label}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {cof.range}
                      </div>
                    </td>

                    {/* Celdas de datos */}
                    {fofLabels.map((_, fofIdx) => {
                      const celda = getCelda(cofIdx, fofIdx);
                      const count = celda?.SegmentosCantidad || 0;
                      const colorClass = getRiskColor(cofIdx, fofIdx);

                      return (
                        <td
                          key={fofIdx}
                          className={`border-2 border-gray-400 p-3 text-center cursor-pointer hover:opacity-80 transition-opacity w-1/7 ${colorClass}`}
                          onClick={() => handleCellClick(cofIdx, fofIdx)}
                        >
                          <div className="text-lg font-bold text-gray-800">
                            {count}
                          </div>
                          {count > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              segments
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas de Resumen */}
          {/* Tarjetas de Resumen */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Segmentos */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    Total Segments
                  </p>
                  <p className="text-3xl font-bold text-blue-800">
                    {heatmapConDetalle.reduce(
                      (sum, c) => sum + c.SegmentosCantidad,
                      0
                    )}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Active pipeline segments
              </p>
            </div>

            {/* Celdas Activas */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Active Cells
                  </p>
                  <p className="text-3xl font-bold text-green-800">
                    {
                      heatmapConDetalle.filter((c) => c.SegmentosCantidad > 0)
                        .length
                    }
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">of 49 total cells</p>
            </div>

            {/* Nivel de Riesgo Promedio */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
 <div>
  <p className="text-sm font-medium text-orange-600 mb-1">
    Avg Risk Level
  </p>
  <p className="text-3xl font-bold text-orange-800">
    {(() => {
      const activeData = heatmapConDetalle.filter(
        (c) => c.SegmentosCantidad > 0
      );
      if (activeData.length === 0) return "0.0";
      const avgRisk =
        activeData.reduce(
          (sum, c) => sum + (c.cofIndex + c.fofIndex),
          0
        ) / activeData.length;
      return avgRisk.toFixed(1);
    })()}
  </p>
  <p className="text-xs text-gray-600 mt-1">
    {(() => {
      const activeData = heatmapConDetalle.filter(
        (c) => c.SegmentosCantidad > 0
      );
      if (activeData.length === 0) return "No risk";
      const avgRisk =
        activeData.reduce(
          (sum, c) => sum + (c.cofIndex + c.fofIndex),
          0
        ) / activeData.length;
      if (avgRisk <= 2) return "Low Risk";
      if (avgRisk <= 5) return "Medium Risk";
      return "High Risk";
    })()}
  </p>
</div>

                <div className="bg-orange-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-2">
                Combined CoF + FoF index
              </p>
            </div>

            {/* Celda con Mayor Concentración */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">
                    Max Concentration
                  </p>
                  <p className="text-3xl font-bold text-purple-800">
                    {Math.max(
                      ...heatmapConDetalle.map((c) => c.SegmentosCantidad)
                    )}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Cell (
                {(() => {
                  const maxCell = heatmapConDetalle.find(
                    (c) =>
                      c.SegmentosCantidad ===
                      Math.max(
                        ...heatmapConDetalle.map((c) => c.SegmentosCantidad)
                      )
                  );
                  return maxCell
                    ? `${maxCell.cofIndex},${maxCell.fofIndex}`
                    : "0,0";
                })()}
                )
              </p>
            </div>
          </div>
        </div>

        {/* Panel de Detalle */}
        {selectedCell && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Cell Details</h2>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-600">CoF Index</div>
                <div className="text-lg font-bold">{selectedCell.cofIndex}</div>
                <div className="text-xs text-gray-500">
                  {cofLabels[selectedCell.cofIndex]?.label}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-600">FoF Index</div>
                <div className="text-lg font-bold">{selectedCell.fofIndex}</div>
                <div className="text-xs text-gray-500">
                  {fofLabels[selectedCell.fofIndex]?.label}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Segments</div>
                <div className="text-lg font-bold">
                  {selectedCell.SegmentosCantidad}
                </div>
                <div className="text-xs text-gray-500">Total count</div>
              </div>
            </div>

            {selectedCell.Segmentos && selectedCell.Segmentos.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Segment Details</h3>
                <div className="max-h-64 overflow-y-auto rounded border border-gray-200 shadow-sm">
                  <table className="min-w-full text-sm text-left text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                      <tr>
                        <th className="px-4 py-2">Número de Segmento</th>
                        <th className="px-4 py-2">CoF Total</th>
                        <th className="px-4 py-2">FoF Total</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Begin</th>
                        <th className="px-4 py-2">End</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCell.Segmentos.map((seg, idx) => (
                        <tr
                          key={idx}
                          className="border-t hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-2 font-medium">
                            {seg.segmento}
                          </td>
                          <td className="px-4 py-2">
                            {seg.cofTotal.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className="px-4 py-2">
                            {seg.fofTotal.toExponential(2)}
                          </td>
                          <td className="px-4 py-2">{seg.Name}</td>
                          <td className="px-4 py-2">
                            {seg.Begin.toFixed(0)} mts
                          </td>
                          <td className="px-4 py-2">
                            {seg.End.toFixed(0)} mts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
