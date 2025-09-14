import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GraficaDuctoMatriz from "./GraficaDuctoMatriz";

export default function RiskMatrixHeatmap() {
  const location = useLocation();
  const navigate = useNavigate();
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
    const rules = {
      0: [
        { max: 1, color: "bg-[#fd7e14]" },
        { max: 3, color: "bg-[#dc3545]" },
        { max: Infinity, color: "bg-[#b21f2d]" },
      ],
      1: [
        { max: 0, color: "bg-[#ffc107]" },
        { max: 2, color: "bg-[#fd7e14]" },
        { max: 4, color: "bg-[#dc3545]" },
        { max: Infinity, color: "bg-[#b21f2d]" },
      ],
      2: [
        { max: 1, color: "bg-[#ffc107]" },
        { max: 3, color: "bg-[#fd7e14]" },
        { max: 5, color: "bg-[#dc3545]" },
        { max: Infinity, color: "bg-[#b21f2d]" },
      ],
      3: [
        { max: 2, color: "bg-[#ffc107]" },
        { max: 4, color: "bg-[#fd7e14]" },
        { max: Infinity, color: "bg-[#dc3545]" },
      ],
      4: [
        { max: 0, color: "bg-[#28a745]" },
        { max: 3, color: "bg-[#ffc107]" },
        { max: 5, color: "bg-[#fd7e14]" },
        { max: Infinity, color: "bg-[#dc3545]" },
      ],
      5: [
        { max: 1, color: "bg-[#28a745]" },
        { max: 4, color: "bg-[#ffc107]" },
        { max: Infinity, color: "bg-[#fd7e14]" },
      ],
      6: [
        { max: 2, color: "bg-[#28a745]" },
        { max: 5, color: "bg-[#ffc107]" },
        { max: Infinity, color: "bg-[#fd7e14]" },
      ],
    };

    const rowRules = rules[rowIndex];
    if (!rowRules) return "bg-gray-200";

    const rule = rowRules.find((r) => colIndex <= r.max);
    return rule ? rule.color : "bg-gray-200";
  };

  const handleCellClick = (cofIndex, fofIndex) => {
    const celda = getCelda(cofIndex, fofIndex);
    setSelectedCell(celda);
  };

  // Calcular métricas
  const totalSegments = heatmapConDetalle.reduce(
    (sum, c) => sum + c.SegmentosCantidad,
    0
  );
  const activeCells = heatmapConDetalle.filter(
    (c) => c.SegmentosCantidad > 0
  ).length;
  const maxConcentration = Math.max(
    ...heatmapConDetalle.map((c) => c.SegmentosCantidad)
  );
  const maxCell = heatmapConDetalle.find(
    (c) => c.SegmentosCantidad === maxConcentration
  );

  const activeData = heatmapConDetalle.filter((c) => c.SegmentosCantidad > 0);
  const avgRisk =
    activeData.length > 0
      ? activeData.reduce((sum, c) => sum + (c.cofIndex + c.fofIndex), 0) /
        activeData.length
      : 0;

  const getRiskLevel = (risk) => {
    if (risk <= 2) return "Bajo";
    if (risk <= 5) return "Medio";
    return "Alto";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Matriz de Evaluación de Riesgos
          </h1>
          <p className="mt-2 text-gray-500">
            Sistema de análisis CoF - FoF para evaluación integral de riesgos
          </p>
        </div>

        {/* Panel de información general */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Resumen del Análisis
            </h2>
          </div>

          <div className="p-6">
            {/* Estado de la selección */}
            <div className="p-4 bg-gray-50 rounded-lg border mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Matriz de Riesgo CoF - FoF
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Analizado
                </span>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total de Segmentos */}
              <div className="relative p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Total Segmentos
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {totalSegments}
                    </p>
                    <p className="text-sm text-gray-500">
                      Segmentos analizados
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Celdas Activas */}
              <div className="relative p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Celdas Activas
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {activeCells}
                    </p>
                    <p className="text-sm text-gray-500">
                      de 49 celdas totales
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Nivel de Riesgo */}
              <div className="relative p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Nivel de Riesgo
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {avgRisk.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Promedio - {getRiskLevel(avgRisk)}
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      avgRisk <= 2
                        ? "bg-green-500"
                        : avgRisk <= 5
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Mayor Concentración */}
              <div className="relative p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Máxima Concentración
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {maxConcentration}
                    </p>
                    <p className="text-sm text-gray-500">
                      {maxCell &&
                        `Celda (${maxCell.cofIndex},${maxCell.fofIndex})`}
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matriz Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900">
                  Matriz de Evaluación CoF - FoF
                </h3>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">Alto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600">Medio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Bajo</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <table className="border-collapse border-2 border-gray-300 w-full table-fixed bg-white">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 p-4 w-[140px]"></th>
                    <th
                      colSpan={fofLabels.length}
                      className="bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-gray-300 p-4 text-center text-xl font-bold text-blue-800"
                    >
                      FoF (Frequency of Failure)
                    </th>
                  </tr>

                  <tr>
                    <th className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 p-3 text-center text-lg font-bold text-gray-700">
                      CoF (US$)
                    </th>
                    {fofLabels.map((fof, idx) => (
                      <th
                        key={idx}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-gray-300 p-3 w-1/7"
                      >
                        <div className="text-xs font-semibold text-center text-blue-800">
                          {fof.label}
                        </div>
                        <div className="text-xs text-blue-600 text-center mt-1">
                          {fof.range}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {cofLabels.map((cof, cofIdx) => (
                    <tr key={cofIdx}>
                      <td className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-gray-300 p-4 w-[140px]">
                        <div className="text-xs font-semibold text-blue-800">
                          {cof.label}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {cof.range}
                        </div>
                      </td>

                      {fofLabels.map((_, fofIdx) => {
                        const celda = getCelda(cofIdx, fofIdx);
                        const count = celda?.SegmentosCantidad || 0;
                        const colorClass = getRiskColor(cofIdx, fofIdx);

                        return (
                          <td
                            key={fofIdx}
                            className={`border-2 border-gray-300 p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 w-1/7 ${colorClass} relative group`}
                            onClick={() => handleCellClick(cofIdx, fofIdx)}
                          >
                            <div className="text-xl font-bold text-white drop-shadow-lg">
                              {count}
                            </div>
                            {count > 0 && (
                              <div className="text-xs text-white/90 mt-1 font-medium drop-shadow">
                                segmentos
                              </div>
                            )}

                            {/* Efecto hover */}
                            <div className="absolute inset-0 bg-white/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                            {/* Indicador de datos */}
                            {count > 0 && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-white/70 rounded-full"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel de Detalle */}
        {selectedCell && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalle de Celda
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="group relative p-2 border rounded-lg text-left transition-all duration-200 border-gray-300 hover:border-blue-500 hover:shadow-md bg-white hover:bg-blue-50 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="relative p-4 border rounded-lg bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Índice CoF
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {selectedCell.cofIndex}
                      </p>
                      <p className="text-sm text-gray-500">
                        {cofLabels[selectedCell.cofIndex]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="relative p-4 border rounded-lg bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Índice FoF
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {selectedCell.fofIndex}
                      </p>
                      <p className="text-sm text-gray-500">
                        {fofLabels[selectedCell.fofIndex]?.label}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="relative p-4 border rounded-lg bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Segmentos
                      </h4>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {selectedCell.SegmentosCantidad}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total de segmentos
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              {selectedCell.Segmentos && selectedCell.Segmentos.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900">
                      Detalle de Segmentos
                    </h4>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <div className="max-h-80 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Segmento
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                CoF Total
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                FoF Total
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Nombre
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Inicio
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Fin
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedCell.Segmentos.map((seg, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-blue-50 transition-colors duration-150"
                              >
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {seg.segmento}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {seg.cofTotal.toLocaleString("es-ES", {
                                    style: "currency",
                                    currency: "USD",
                                    maximumFractionDigits: 0,
                                  })}
                                </td>
                                <td className="px-4 py-3 text-gray-700 font-mono text-xs">
                                  {seg.fofTotal.toExponential(2)}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {seg.Name}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {seg.Begin.toFixed(0)} m
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                  {seg.End.toFixed(0)} m
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gráfica del ducto */}
        <div className="mb-8">
          {" "}
          <GraficaDuctoMatriz
            heatmapConDetalle={receivedHeatmap}
            segmentosFiltrados={selectedCell ? selectedCell.Segmentos : null}
          />{" "}
        </div>

        {/* Información */}
        <div
          className="rounded-lg p-4 border border-green-200"
          style={{
            background:
              "linear-gradient(to top, rgba(38, 92, 79, 0.1), rgba(22, 54, 46, 0.05))",
          }}
        >
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-green-700 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-900">
                Análisis de Riesgo Completado
              </h4>
              <p className="text-sm text-green-800 mt-1">
                La matriz de evaluación CoF-FoF ha sido generada exitosamente.
                Haga clic en cualquier celda de la matriz para ver el detalle de
                los segmentos asociados a esa combinación de riesgo.
              </p>
            </div>
          </div>
        </div>

        {/* Botón volver */}
        <div className="mt-8 flex justify-center">
          <button
            className="group relative p-4 border rounded-lg text-left transition-all duration-200 border-gray-300 hover:border-blue-500 hover:shadow-md bg-white hover:bg-blue-50 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100">
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
                  Volver al Panel Principal
                </h4>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
