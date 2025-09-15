import React, { useState, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";

export default function GraficaDuctoMatriz(props) {
  const location = useLocation();
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Estados para el zoom
  const [viewBox, setViewBox] = useState({ start: 0, end: 100 }); // Porcentajes
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectionRect, setSelectionRect] = useState(null);
  const ductoRef = useRef(null);
  
  // Recibimos los datos del state o arreglo vacío
  const receivedHeatmap = props.heatmapConDetalle || location.state?.heatmapConDetalle || [];
  console.log("datos recibidos", receivedHeatmap)

  // Configuración de la matriz de riesgo
  const cofLabels = [
    { label: "Extreme", range: "(2e+9 - ∞)" },
    { label: "Critical", range: "(2e+8 - 2e+9)" },
    { label: "Severe", range: "(2e+6 - 2e+8)" },
    { label: "Serious", range: "(5e+5 - 2e+6)" },
    { label: "Moderate", range: "(4e+4 - 5e+5)" },
    { label: "Minor", range: "(4e+3 - 4e+4)" },
    { label: "Insignificant", range: "(-∞ - 4e+3)" },
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

  // Función corregida para determinar el índice CoF basado en el valor cofTotal
  const getCofIndex = (cofTotal) => {
    if (cofTotal >= 2e9) return 0; // Extreme
    if (cofTotal >= 2e8) return 1; // Critical
    if (cofTotal >= 2e6) return 2; // Severe
    if (cofTotal >= 5e5) return 3; // Serious
    if (cofTotal >= 4e4) return 4; // Moderate
    if (cofTotal >= 4e3) return 5; // Minor
    return 6; // Insignificant
  };

  // Función corregida para determinar el índice FoF basado en el valor fofTotal
  const getFofIndex = (fofTotal) => {
    if (fofTotal >= 1e0) return 6; // Almost Certain
    if (fofTotal >= 1e-1) return 5; // Highly Likely
    if (fofTotal >= 1e-2) return 4; // Very Likely
    if (fofTotal >= 1e-3) return 3; // Likely
    if (fofTotal >= 1e-4) return 2; // Possible
    if (fofTotal >= 1e-5) return 1; // Rare
    return 0; // Almost Impossible
  };

  // Función corregida para obtener el color de riesgo basado en los índices
  // Esta función debe ser EXACTAMENTE igual a la de RiskMatrixHeatmap
  const getRiskColor = (cofIndex, fofIndex) => {
    const rules = {
      0: [
        { max: 1, color: "#fd7e14" }, // orange
        { max: 3, color: "#dc3545" }, // red
        { max: Infinity, color: "#b21f2d" }, // dark red
      ],
      1: [
        { max: 0, color: "#ffc107" }, // yellow
        { max: 2, color: "#fd7e14" }, // orange
        { max: 4, color: "#dc3545" }, // red
        { max: Infinity, color: "#b21f2d" }, // dark red
      ],
      2: [
        { max: 1, color: "#ffc107" }, // yellow
        { max: 3, color: "#fd7e14" }, // orange
        { max: 5, color: "#dc3545" }, // red
        { max: Infinity, color: "#b21f2d" }, // dark red
      ],
      3: [
        { max: 2, color: "#ffc107" }, // yellow
        { max: 4, color: "#fd7e14" }, // orange
        { max: Infinity, color: "#dc3545" }, // red
      ],
      4: [
        { max: 0, color: "#28a745" }, // green
        { max: 3, color: "#ffc107" }, // yellow
        { max: 5, color: "#fd7e14" }, // orange
        { max: Infinity, color: "#dc3545" }, // red
      ],
      5: [
        { max: 1, color: "#28a745" }, // green
        { max: 4, color: "#ffc107" }, // yellow
        { max: Infinity, color: "#fd7e14" }, // orange
      ],
      6: [
        { max: 2, color: "#28a745" }, // green
        { max: 5, color: "#ffc107" }, // yellow
        { max: Infinity, color: "#fd7e14" }, // orange
      ],
    };

    const rowRules = rules[cofIndex];
    if (!rowRules) return "#6b7280"; // gray

    const rule = rowRules.find((r) => fofIndex <= r.max);
    return rule ? rule.color : "#6b7280";
  };

  // Extraer todos los segmentos y calcular dimensiones
  const allSegments = useMemo(() => {
    const segments = [];
    receivedHeatmap.forEach(item => {
      if (item.Segmentos && item.Segmentos.length > 0) {
        segments.push(...item.Segmentos.map(segment => ({
          ...segment,
          cofIndex: getCofIndex(segment.cofTotal),
          fofIndex: getFofIndex(segment.fofTotal),
          cofLabel: cofLabels[getCofIndex(segment.cofTotal)]?.label || 'Unknown',
          fofLabel: fofLabels[getFofIndex(segment.fofTotal)]?.label || 'Unknown',
          riskColor: getRiskColor(getCofIndex(segment.cofTotal), getFofIndex(segment.fofTotal))
        })));
      }
    });
    return segments.sort((a, b) => a.Begin - b.Begin);
  }, [receivedHeatmap]);

  const pipelineData = useMemo(() => {
    if (allSegments.length === 0) return { totalLength: 0, segments: [] };
    
    const minPosition = Math.min(...allSegments.map(s => s.Begin));
    const maxPosition = Math.max(...allSegments.map(s => s.End));
    const totalLength = maxPosition - minPosition;
    
    return {
      totalLength,
      minPosition,
      maxPosition,
      segments: allSegments.map(segment => ({
        ...segment,
        relativeStart: ((segment.Begin - minPosition) / totalLength) * 100,
        relativeEnd: ((segment.End - minPosition) / totalLength) * 100,
        length: segment.End - segment.Begin
      }))
    };
  }, [allSegments]);

  // Convertir coordenadas del mouse a porcentaje del ducto
  const getRelativePosition = useCallback((clientX) => {
    if (!ductoRef.current) return 0;
    const rect = ductoRef.current.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(100, relativeX * 100));
  }, []);

  // Eventos del zoom
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    
    const position = getRelativePosition(e.clientX);
    setDragStart(position);
    setIsDragging(true);
    setSelectionRect({ start: position, end: position });
  }, [getRelativePosition]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || dragStart === null) return;
    
    const position = getRelativePosition(e.clientX);
    setSelectionRect({ start: dragStart, end: position });
  }, [isDragging, dragStart, getRelativePosition]);

  const handleMouseUp = useCallback((e) => {
    if (!isDragging || !selectionRect) return;
    
    const { start, end } = selectionRect;
    const minPos = Math.min(start, end);
    const maxPos = Math.max(start, end);
    
    // Verificar que la selección sea lo suficientemente grande
    if (maxPos - minPos > 1) { // Al menos 1% de diferencia
      // Convertir la selección a coordenadas del viewport actual
      const currentRange = viewBox.end - viewBox.start;
      const newStart = viewBox.start + (minPos / 100) * currentRange;
      const newEnd = viewBox.start + (maxPos / 100) * currentRange;
      
      setViewBox({ start: newStart, end: newEnd });
    }
    
    // Limpiar estado
    setIsDragging(false);
    setDragStart(null);
    setSelectionRect(null);
  }, [isDragging, selectionRect, viewBox]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setSelectionRect(null);
    }
    setHoveredSegment(null);
  }, [isDragging]);

  // Resetear zoom
  const resetZoom = () => {
    setViewBox({ start: 0, end: 100 });
    setIsDragging(false);
    setDragStart(null);
    setSelectionRect(null);
  };

  // Zoom por doble click
  const handleDoubleClick = useCallback((e) => {
    const position = getRelativePosition(e.clientX);
    const currentRange = viewBox.end - viewBox.start;
    const newRange = currentRange / 2;
    
    const actualPosition = viewBox.start + (position / 100) * currentRange;
    const newStart = Math.max(0, actualPosition - newRange / 2);
    const newEnd = Math.min(100, newStart + newRange);
    const adjustedStart = Math.max(0, newEnd - newRange);
    
    setViewBox({ start: adjustedStart, end: newEnd });
  }, [getRelativePosition, viewBox]);

  // Filtrar segmentos visibles en el viewport actual
  const visibleSegments = useMemo(() => {
    return pipelineData.segments.filter(segment => {
      // Convertir las posiciones del segmento al viewport actual
      const segStart = segment.relativeStart;
      const segEnd = segment.relativeEnd;
      
      // Verificar si el segmento intersecta con el viewport actual
      return segEnd >= viewBox.start && segStart <= viewBox.end;
    });
  }, [pipelineData.segments, viewBox]);

  // Calcular posiciones de los segmentos en el viewport actual
  const getSegmentViewportPosition = (segment) => {
    const viewportRange = viewBox.end - viewBox.start;
    const segmentStart = Math.max(viewBox.start, segment.relativeStart);
    const segmentEnd = Math.min(viewBox.end, segment.relativeEnd);
    
    return {
      left: ((segmentStart - viewBox.start) / viewportRange) * 100,
      width: ((segmentEnd - segmentStart) / viewportRange) * 100
    };
  };

  const handleMouseEnter = (segment, event) => {
    if (isDragging) return;
    setHoveredSegment(segment);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleSegmentMouseMove = (event) => {
    if (isDragging) return;
    if (hoveredSegment) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleSegmentLeave = () => {
    if (!isDragging) {
      setHoveredSegment(null);
    }
  };

  const handleSegmentClick = (segment) => {
    if (isDragging) return;
    setSelectedSegment(selectedSegment?.segmento === segment.segmento ? null : segment);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  if (pipelineData.segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-2">No hay segmentos para mostrar</h2>
          <p className="text-gray-500">No se encontraron datos de segmentos en el ducto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header del gráfico */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {allSegments[0]?.Name || 'Pipeline'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={resetZoom}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              Resetear Zoom
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Longitud: {formatNumber(pipelineData.totalLength)}m | {pipelineData.segments.length} segmentos
        </p>
        {viewBox.start !== 0 || viewBox.end !== 100 ? (
          <p className="text-blue-600 text-sm">
            Vista: {((viewBox.end - viewBox.start) / 100 * pipelineData.totalLength).toFixed(0)}m 
            ({(viewBox.end - viewBox.start).toFixed(1)}% del total)
          </p>
        ) : null}
      </div>

      {/* Gráfico del ducto */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="relative">
          {/* Escala superior */}
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>
              {formatNumber(pipelineData.minPosition + (viewBox.start / 100) * pipelineData.totalLength)}m
            </span>
            <span>
              Zoom: {(100 / (viewBox.end - viewBox.start)).toFixed(1)}x
            </span>
            <span>
              {formatNumber(pipelineData.minPosition + (viewBox.end / 100) * pipelineData.totalLength)}m
            </span>
          </div>
          
          {/* Contenedor del ducto */}
          <div 
            ref={ductoRef}
            className="relative h-20 mb-12 cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={handleDoubleClick}
          >
            {/* Ducto base con gradiente metálico */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-lg shadow-lg">
              {/* Efecto de brillo superior */}
              <div className="absolute top-1 left-1 right-1 h-4 bg-gradient-to-b from-gray-200 to-transparent rounded-t-lg opacity-70"></div>
              {/* Efecto de sombra inferior */}
              <div className="absolute bottom-1 left-1 right-1 h-4 bg-gradient-to-t from-gray-600 to-transparent rounded-b-lg opacity-50"></div>
            </div>
            
            {/* Segmentos del ducto */}
            {visibleSegments.map((segment, index) => {
              const position = getSegmentViewportPosition(segment);
              
              // Solo mostrar si tiene ancho visible
              if (position.width < 0.1) return null;
              
              return (
                <div key={`segment-${segment.segmento}-${index}`}>
                  {/* Línea divisoria */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10"
                    style={{
                      left: `${position.left}%`,
                    }}
                  ></div>
                  
                  {/* Área del segmento para hover y click */}
                  <div
                    className="absolute top-0 bottom-0 hover:bg-black hover:bg-opacity-10 transition-all duration-200 z-20"
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                      backgroundColor: hoveredSegment?.segmento === segment.segmento ? 
                        'rgba(0,0,0,0.1)' : 
                        selectedSegment?.segmento === segment.segmento ? 
                        'rgba(59, 130, 246, 0.2)' : 'transparent',
                      cursor: isDragging ? 'crosshair' : 'pointer'
                    }}
                    onMouseEnter={(e) => handleMouseEnter(segment, e)}
                    onMouseMove={handleSegmentMouseMove}
                    onMouseLeave={handleSegmentLeave}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    {/* Indicador de riesgo basado en matriz */}
                    <div 
                      className="absolute bottom-0 h-2 w-full z-10"
                      style={{
                        backgroundColor: segment.riskColor,
                      }}
                    ></div>
                    
                    {/* Etiqueta del segmento si hay espacio suficiente */}
                    {position.width > 8 && (
                      <div className="absolute top-1 left-1 text-xs font-mono text-gray-700 bg-white bg-opacity-75 px-1 rounded">
                        {segment.segmento}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Rectángulo de selección */}
            {selectionRect && (
              <div
                className="absolute top-0 bottom-0 bg-blue-200 bg-opacity-30 border-2 border-blue-400 border-dashed pointer-events-none z-30"
                style={{
                  left: `${Math.min(selectionRect.start, selectionRect.end)}%`,
                  width: `${Math.abs(selectionRect.end - selectionRect.start)}%`,
                }}
              ></div>
            )}
            
            {/* Línea divisoria final */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10"
              style={{ right: '0%' }}
            ></div>
          </div>

          {/* Instrucciones de uso */}
          <div className="text-center text-sm text-gray-500 mb-4">
            <p>
              <span className="font-medium">Arrastra</span> para seleccionar área de zoom • 
              <span className="font-medium"> Doble click</span> para zoom 2x • 
              <span className="font-medium"> Click</span> en segmento para detalles
            </p>
          </div>

          {/* Leyenda de colores de riesgo */}
          <div className="flex justify-center items-center space-x-6 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#28a745' }}></div>
              <span className="text-sm text-gray-700">Bajo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc107' }}></div>
              <span className="text-sm text-gray-700">Medio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fd7e14' }}></div>
              <span className="text-sm text-gray-700">Alto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc3545' }}></div>
              <span className="text-sm text-gray-700">Crítico</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#b21f2d' }}></div>
              <span className="text-sm text-gray-700">Extremo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle del segmento seleccionado */}
      {selectedSegment && (
        <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div 
                className="w-1 h-8 mr-4 rounded"
                style={{ backgroundColor: selectedSegment.riskColor }}
              ></div>
              <h3 className="text-2xl font-bold text-gray-800">
                Detalle del Segmento {selectedSegment.segmento}
              </h3>
            </div>
            <button
              onClick={() => setSelectedSegment(null)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Información básica */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-2">Información Básica</div>
              <div className="space-y-2">
                <div><span className="font-medium">Nombre:</span> {selectedSegment.Name}</div>
                <div><span className="font-medium">Posición:</span> {formatNumber(selectedSegment.Begin)}m - {formatNumber(selectedSegment.End)}m</div>
                <div><span className="font-medium">Longitud:</span> {formatNumber(selectedSegment.length)}m</div>
              </div>
            </div>

            {/* Matriz de Riesgo CoF */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="text-sm text-red-600 font-medium mb-2">CoF (Consequence of Failure)</div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-800">Índice {selectedSegment.cofIndex}</div>
                <div className="text-sm text-red-600">{selectedSegment.cofLabel}</div>
                <div className="text-xs text-red-500">{formatCurrency(selectedSegment.cofTotal)}</div>
              </div>
            </div>

            {/* Matriz de Riesgo FoF */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">FoF (Frequency of Failure)</div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-800">Índice {selectedSegment.fofIndex}</div>
                <div className="text-sm text-green-600">{selectedSegment.fofLabel}</div>
                <div className="text-xs text-green-500 font-mono">{selectedSegment.fofTotal.toExponential(2)}</div>
              </div>
            </div>

            {/* Nivel de Riesgo */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-2">Nivel de Riesgo</div>
              <div className="space-y-2">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: selectedSegment.riskColor }}
                ></div>
                <div className="text-sm text-purple-600 text-center">
                  Matriz ({selectedSegment.cofIndex},{selectedSegment.fofIndex})
                </div>
                <div className="text-xs text-purple-500 text-center">
                  Valor: {formatCurrency(selectedSegment.Value)}
                </div>
              </div>
            </div>
          </div>

          {/* Información técnica adicional */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Información Técnica</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium">Analysis Item ID:</span> {selectedSegment.AnalysisItemID}</div>
              <div><span className="font-medium">Company:</span> {selectedSegment.Company}</div>
              <div><span className="font-medium">Pipeline:</span> {selectedSegment.Pipeline}</div>
              <div><span className="font-medium">Section:</span> {selectedSegment.Section}</div>
              <div><span className="font-medium">Station ID:</span> {selectedSegment.StationID}</div>
              <div><span className="font-medium">System:</span> {selectedSegment.System}</div>
              <div><span className="font-medium">Transmission Line ID:</span> {selectedSegment.TransmissionLineID}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredSegment && !isDragging && (
        <div
          className="fixed z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm pointer-events-none"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="space-y-2">
            <div className="font-semibold text-lg border-b border-gray-600 pb-2">
              Segmento {hoveredSegment.segmento}
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div><span className="font-medium">Posición:</span> {formatNumber(hoveredSegment.Begin)}m - {formatNumber(hoveredSegment.End)}m</div>
              <div><span className="font-medium">Longitud:</span> {formatNumber(hoveredSegment.length)}m</div>
              <div>
                <span className="font-medium">CoF:</span> 
                <span className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: hoveredSegment.riskColor, color: 'white' }}>
                  {hoveredSegment.cofLabel} ({hoveredSegment.cofIndex})
                </span>
              </div>
              <div>
                <span className="font-medium">FoF:</span> 
                <span className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: hoveredSegment.riskColor, color: 'white' }}>
                  {hoveredSegment.fofLabel} ({hoveredSegment.fofIndex})
                </span>
              </div>
              <div><span className="font-medium">Valor:</span> {formatCurrency(hoveredSegment.Value)}</div>
              <div><span className="font-medium">CoF Total:</span> {formatCurrency(hoveredSegment.cofTotal)}</div>
              <div><span className="font-medium">FoF Total:</span> {hoveredSegment.fofTotal.toExponential(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}