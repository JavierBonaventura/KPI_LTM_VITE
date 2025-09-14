import React, { useState, useMemo, useCallback, useRef } from "react";

export default function GraficaDuctoMatrizWithZoom(props) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Estados para zoom y pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, panOffset: 0 });
  
  const containerRef = useRef(null);
  
  // Datos de ejemplo (simularemos los datos que me mostraste)
  const segmentosFiltrados = [
    {
      segmento: 3,
      cofTotal: 8381320.67089454,
      fofTotal: 0.00031985371478,
      Name: "GSD 48 Cactus - Est. 1 Cardenas",
      Begin: 38.83317,
      End: 50.62739,
      Value: 3325578.29322852
    },
    {
      segmento: 83,
      cofTotal: 9744063.270367358,
      fofTotal: 0.00024089266900000002,
      Name: "GSD 48 Cactus - Est. 1 Cardenas",
      Begin: 25455.04004,
      End: 25455.04004082,
      Value: 3543155.49877727
    }
  ];

  // Funciones de matriz de riesgo
  const getCofIndex = (cofTotal) => {
    if (cofTotal >= 2e9) return 0;
    if (cofTotal >= 2e8) return 1;
    if (cofTotal >= 2e6) return 2;
    if (cofTotal >= 5e5) return 3;
    if (cofTotal >= 4e4) return 4;
    if (cofTotal >= 4e3) return 5;
    return 6;
  };

  const getFofIndex = (fofTotal) => {
    if (fofTotal >= 1e0) return 6;
    if (fofTotal >= 1e-1) return 5;
    if (fofTotal >= 1e-2) return 4;
    if (fofTotal >= 1e-3) return 3;
    if (fofTotal >= 1e-4) return 2;
    if (fofTotal >= 1e-5) return 1;
    return 0;
  };

  const getRiskColor = (cofIndex, fofIndex) => {
    const rules = {
      0: [
        { max: 1, color: "#fd7e14" },
        { max: 3, color: "#dc3545" },
        { max: Infinity, color: "#b21f2d" },
      ],
      1: [
        { max: 0, color: "#ffc107" },
        { max: 2, color: "#fd7e14" },
        { max: 4, color: "#dc3545" },
        { max: Infinity, color: "#b21f2d" },
      ],
      2: [
        { max: 1, color: "#ffc107" },
        { max: 3, color: "#fd7e14" },
        { max: 5, color: "#dc3545" },
        { max: Infinity, color: "#b21f2d" },
      ],
      3: [
        { max: 2, color: "#ffc107" },
        { max: 4, color: "#fd7e14" },
        { max: Infinity, color: "#dc3545" },
      ],
      4: [
        { max: 0, color: "#28a745" },
        { max: 3, color: "#ffc107" },
        { max: 5, color: "#fd7e14" },
        { max: Infinity, color: "#dc3545" },
      ],
      5: [
        { max: 1, color: "#28a745" },
        { max: 4, color: "#ffc107" },
        { max: Infinity, color: "#fd7e14" },
      ],
      6: [
        { max: 2, color: "#28a745" },
        { max: 5, color: "#ffc107" },
        { max: Infinity, color: "#fd7e14" },
      ],
    };

    const rowRules = rules[cofIndex];
    if (!rowRules) return "#6b7280";

    const rule = rowRules.find((r) => fofIndex <= r.max);
    return rule ? rule.color : "#6b7280";
  };

  // Procesar segmentos
  const allSegments = useMemo(() => {
    return segmentosFiltrados.map(segment => ({
      ...segment,
      cofIndex: getCofIndex(segment.cofTotal),
      fofIndex: getFofIndex(segment.fofTotal),
      riskColor: getRiskColor(getCofIndex(segment.cofTotal), getFofIndex(segment.fofTotal)),
      length: segment.End - segment.Begin
    })).sort((a, b) => a.Begin - b.Begin);
  }, []);

  // Calcular dimensiones del ducto
  const pipelineData = useMemo(() => {
    if (allSegments.length === 0) return { totalLength: 0, segments: [] };
    
    const minPosition = Math.min(...allSegments.map(s => s.Begin));
    const maxPosition = Math.max(...allSegments.map(s => s.End));
    const totalLength = maxPosition - minPosition;
    
    // Ancho mínimo para segmentos muy pequeños (0.1% del ducto)
    const minWidth = 0.1;
    
    return {
      totalLength,
      minPosition,
      maxPosition,
      segments: allSegments.map(segment => {
        const relativeStart = ((segment.Begin - minPosition) / totalLength) * 100;
        const relativeEnd = ((segment.End - minPosition) / totalLength) * 100;
        const calculatedWidth = relativeEnd - relativeStart;
        
        return {
          ...segment,
          relativeStart,
          relativeEnd,
          displayWidth: Math.max(calculatedWidth, minWidth), // Ancho mínimo para visualización
          actualWidth: calculatedWidth
        };
      })
    };
  }, [allSegments]);

  // Funciones de zoom y pan
  const handleWheel = useCallback((event) => {
    event.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const containerWidth = rect.width;
    
    // Calcular punto de zoom relativo (0-1)
    const zoomPoint = mouseX / containerWidth;
    
    // Factor de zoom
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoomLevel = Math.max(1, Math.min(50, zoomLevel * zoomFactor));
    
    // Ajustar pan para mantener el punto bajo el mouse
    const oldVisibleStart = panOffset;
    const oldVisibleEnd = panOffset + (100 / zoomLevel);
    const oldVisibleWidth = oldVisibleEnd - oldVisibleStart;
    
    const newVisibleWidth = 100 / newZoomLevel;
    const zoomPointInVisible = zoomPoint * (containerWidth / containerWidth); // Normalizado
    const zoomPointInDuct = oldVisibleStart + (oldVisibleWidth * zoomPointInVisible);
    
    const newPanOffset = Math.max(0, Math.min(100 - newVisibleWidth, 
      zoomPointInDuct - (newVisibleWidth * zoomPointInVisible)));
    
    setZoomLevel(newZoomLevel);
    setPanOffset(newPanOffset);
  }, [zoomLevel, panOffset]);

  const handleMouseDown = useCallback((event) => {
    setIsDragging(true);
    setDragStart({
      x: event.clientX,
      panOffset: panOffset
    });
  }, [panOffset]);

  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.x;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const containerWidth = rect.width;
        const panDelta = -(deltaX / containerWidth) * (100 / zoomLevel);
        const newPanOffset = Math.max(0, Math.min(100 - (100 / zoomLevel), 
          dragStart.panOffset + panDelta));
        setPanOffset(newPanOffset);
      }
    } else if (hoveredSegment) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  }, [isDragging, dragStart, zoomLevel, hoveredSegment]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset zoom
  const resetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
  };

  // Zoom a segmento específico
  const zoomToSegment = (segment) => {
    const segmentCenter = (segment.relativeStart + segment.relativeEnd) / 2;
    const newZoomLevel = Math.min(20, Math.max(5, 100 / Math.max(segment.displayWidth * 2, 5)));
    const newVisibleWidth = 100 / newZoomLevel;
    const newPanOffset = Math.max(0, Math.min(100 - newVisibleWidth, 
      segmentCenter - newVisibleWidth / 2));
    
    setZoomLevel(newZoomLevel);
    setPanOffset(newPanOffset);
  };

  // Calcular segmentos visibles
  const visibleStart = panOffset;
  const visibleEnd = panOffset + (100 / zoomLevel);
  
  const visibleSegments = pipelineData.segments.filter(segment => 
    segment.relativeEnd > visibleStart && segment.relativeStart < visibleEnd
  );

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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {allSegments[0]?.Name || 'Pipeline'}
        </h2>
        <div className="text-gray-600">
          <p>Longitud Total: {formatNumber(pipelineData.totalLength)}m</p>
          <div className="mt-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Mostrando {allSegments.length} segmentos filtrados
            </div>
          </div>
        </div>
      </div>

      {/* Controles de zoom */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Zoom: {zoomLevel.toFixed(1)}x
            </div>
            <div className="text-sm text-gray-600">
              Vista: {formatNumber(pipelineData.minPosition + (visibleStart/100) * pipelineData.totalLength)}m - {formatNumber(pipelineData.minPosition + (visibleEnd/100) * pipelineData.totalLength)}m
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {allSegments.map(segment => (
              <button
                key={segment.segmento}
                onClick={() => zoomToSegment(segment)}
                className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
              >
                Segmento {segment.segmento}
              </button>
            ))}
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
            >
              Reset Zoom
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico del ducto */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-4">
          <div className="text-sm text-gray-500 mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded border-2 border-blue-300"></div>
                <span><strong>Zona activa:</strong> El área azul claro indica zona de zoom</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Rueda del mouse = Zoom</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>Arrastrar = Desplazar</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Escala superior */}
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>{formatNumber(pipelineData.minPosition + (visibleStart/100) * pipelineData.totalLength)}m</span>
            <span>Vista: {formatNumber((visibleEnd - visibleStart)/100 * pipelineData.totalLength)}m</span>
            <span>{formatNumber(pipelineData.minPosition + (visibleEnd/100) * pipelineData.totalLength)}m</span>
          </div>
          
          {/* Contenedor del ducto */}
          <div 
            ref={containerRef}
            className="relative h-20 mb-12 overflow-hidden cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              handleMouseUp();
              setHoveredSegment(null);
            }}
          >
            {/* Ducto base */}
            <div 
              className="absolute inset-y-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 shadow-lg"
              style={{
                left: `${Math.max(0, -visibleStart * zoomLevel)}%`,
                width: `${100 * zoomLevel}%`,
              }}
            >
              {/* Efecto de brillo superior */}
              <div className="absolute top-1 left-4 right-4 h-4 bg-gradient-to-b from-gray-200 to-transparent opacity-70"></div>
              {/* Efecto de sombra inferior */}
              <div className="absolute bottom-1 left-4 right-4 h-4 bg-gradient-to-t from-gray-600 to-transparent opacity-50"></div>
            </div>
            
            {/* Segmentos visibles */}
            {visibleSegments.map((segment, index) => {
              // Calcular posición en la vista actual
              const segmentLeft = Math.max(0, (segment.relativeStart - visibleStart) * zoomLevel);
              const segmentRight = Math.min(100, (segment.relativeEnd - visibleStart) * zoomLevel);
              const segmentWidth = segmentRight - segmentLeft;
              
              return (
                <div key={`segment-${segment.segmento}-${index}`}>
                  {/* Línea divisoria inicial */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gray-700 z-10"
                    style={{ left: `${segmentLeft}%` }}
                  ></div>
                  
                  {/* Área del segmento */}
                  <div
                    className="absolute top-0 bottom-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200"
                    style={{
                      left: `${segmentLeft}%`,
                      width: `${Math.max(segmentWidth, 1)}%`, // Mínimo 1% de ancho
                      backgroundColor: hoveredSegment?.segmento === segment.segmento ? 
                        'rgba(0,0,0,0.1)' : 
                        selectedSegment?.segmento === segment.segmento ? 
                        'rgba(59, 130, 246, 0.2)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      setHoveredSegment(segment);
                      setTooltipPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredSegment(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSegment(selectedSegment?.segmento === segment.segmento ? null : segment);
                    }}
                  >
                    {/* Indicador de riesgo */}
                    <div 
                      className="absolute bottom-0 h-3 w-full"
                      style={{ backgroundColor: segment.riskColor }}
                    ></div>
                    
                    {/* Etiqueta del segmento */}
                    <div className="absolute top-1 left-1 text-xs font-bold text-white bg-black bg-opacity-50 px-1 rounded">
                      {segment.segmento}
                    </div>
                  </div>
                  
                  {/* Línea divisoria final */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gray-700 z-10"
                    style={{ left: `${segmentRight}%` }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Información básica */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-2">Información Básica</div>
              <div className="space-y-2">
                <div><span className="font-medium">Posición:</span> {formatNumber(selectedSegment.Begin)}m - {formatNumber(selectedSegment.End)}m</div>
                <div><span className="font-medium">Longitud:</span> {formatNumber(selectedSegment.length)}m</div>
                <div><span className="font-medium">Valor:</span> {formatCurrency(selectedSegment.Value)}</div>
              </div>
            </div>

            {/* CoF */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="text-sm text-red-600 font-medium mb-2">CoF (Consequence)</div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-800">Índice {selectedSegment.cofIndex}</div>
                <div className="text-xs text-red-500">{formatCurrency(selectedSegment.cofTotal)}</div>
              </div>
            </div>

            {/* FoF */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">FoF (Frequency)</div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-800">Índice {selectedSegment.fofIndex}</div>
                <div className="text-xs text-green-500 font-mono">{selectedSegment.fofTotal.toExponential(2)}</div>
              </div>
            </div>

            {/* Riesgo */}
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {hoveredSegment && (
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
              <div><span className="font-medium">CoF Índice:</span> {hoveredSegment.cofIndex}</div>
              <div><span className="font-medium">FoF Índice:</span> {hoveredSegment.fofIndex}</div>
              <div><span className="font-medium">Valor:</span> {formatCurrency(hoveredSegment.Value)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}