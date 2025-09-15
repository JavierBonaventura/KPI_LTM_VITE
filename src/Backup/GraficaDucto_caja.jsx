import React, { useState, useMemo, useRef, useEffect } from "react";

export default function GraficaDucto({ datos = [] }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [lastMouseX, setLastMouseX] = useState(0);
  const [zoomMode, setZoomMode] = useState('pan'); // 'pan' o 'select'
  const containerRef = useRef(null);

  // Procesar datos de los segmentos
  const processedSegments = useMemo(() => {
    if (!datos || datos.length === 0) return { 
      segments: [], 
      totalLength: 0, 
      minPosition: 0, 
      maxPosition: 0,
      maxFoF: 0,
      minFoF: 0
    };
    
    const minPosition = Math.min(...datos.map(s => s.Begin || 0));
    const maxPosition = Math.max(...datos.map(s => s.End || 0));
    const totalLength = maxPosition - minPosition;
    
    // Calcular min y max FoF para escala dinámica
    const fofValues = datos.map(s => s.FoF || 0).filter(f => f > 0);
    const maxFoF = Math.max(...fofValues, 1e-5);
    const minFoF = Math.min(...fofValues, maxFoF);
    
    const segments = datos.map((segment, index) => ({
      ...segment,
      segmento: index + 1,
      length: (segment.End || 0) - (segment.Begin || 0),
      relativeStart: ((segment.Begin - minPosition) / totalLength) * 100,
      relativeEnd: ((segment.End - minPosition) / totalLength) * 100,
    }));
    
    return {
      segments: segments.sort((a, b) => a.Begin - b.Begin),
      totalLength,
      minPosition,
      maxPosition,
      maxFoF,
      minFoF
    };
  }, [datos]);

  // Función para obtener color basado en FoF con escala dinámica
  const getFofColor = (fofValue) => {
    const fof = fofValue || 0;
    if (fof === 0 || processedSegments.maxFoF === processedSegments.minFoF) {
      return "#6c757d"; // Gris - Sin datos
    }
    
    const { maxFoF, minFoF } = processedSegments;
    const logMax = Math.log10(maxFoF);
    const logMin = Math.log10(minFoF);
    const logFof = Math.log10(fof);
    const normalizedValue = (logFof - logMin) / (logMax - logMin);
    
    if (normalizedValue >= 0.8) return "#dc3545"; // Rojo - Crítico
    if (normalizedValue >= 0.6) return "#fd7e14"; // Naranja - Alto
    if (normalizedValue >= 0.4) return "#ffc107"; // Amarillo - Medio
    if (normalizedValue >= 0.2) return "#28a745"; // Verde - Bajo
    return "#17a2b8"; // Azul - Muy bajo
  };

  // Calcular información del zoom actual
  const zoomInfo = useMemo(() => {
    const visibleLength = processedSegments.totalLength / zoom;
    const panOffset = (pan / 100) * processedSegments.totalLength;
    const startPosition = processedSegments.minPosition - panOffset;
    const endPosition = startPosition + visibleLength;
    
    const visibleSegments = processedSegments.segments.filter(segment => 
      segment.End >= startPosition && segment.Begin <= endPosition
    );
    
    return {
      visibleLength,
      startPosition: Math.max(startPosition, processedSegments.minPosition),
      endPosition: Math.min(endPosition, processedSegments.maxPosition),
      visibleSegmentCount: visibleSegments.length,
      totalSegments: processedSegments.segments.length,
      zoomPercentage: zoom * 100,
      visiblePercentage: (visibleLength / processedSegments.totalLength) * 100
    };
  }, [zoom, pan, processedSegments]);

  // Convertir posición del mouse a posición en el ducto
  const mouseToPosition = (mouseX) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (mouseX - rect.left) / rect.width;
    const visibleLength = processedSegments.totalLength / zoom;
    const panOffset = (pan / 100) * processedSegments.totalLength;
    const startPosition = processedSegments.minPosition - panOffset;
    return startPosition + (relativeX * visibleLength);
  };

  // Manejar inicio de mouse down
  const handleMouseDown = (event) => {
    if (zoomMode === 'select') {
      // Modo selección - iniciar selección de área
      setIsSelecting(true);
      const rect = containerRef.current.getBoundingClientRect();
      const startPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      setSelectionStart(startPos);
      setSelectionEnd(startPos);
    } else {
      // Modo pan - iniciar arrastre
      setIsDragging(true);
      setLastMouseX(event.clientX);
    }
  };

  // Manejar movimiento del mouse
  const handleMouseMove = (event) => {
    if (hoveredSegment && !isDragging && !isSelecting) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
    
    if (isSelecting && containerRef.current) {
      // Actualizar selección
      const rect = containerRef.current.getBoundingClientRect();
      setSelectionEnd({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    } else if (isDragging && containerRef.current) {
      // Pan normal
      const deltaX = event.clientX - lastMouseX;
      const rect = containerRef.current.getBoundingClientRect();
      const panDelta = (deltaX / rect.width) * 100 / zoom;
      
      const maxPan = (zoom - 1) * 50;
      const minPan = -maxPan;
      setPan(Math.max(minPan, Math.min(maxPan, pan + panDelta)));
      setLastMouseX(event.clientX);
    }
  };

  // Manejar fin de mouse up
  const handleMouseUp = (event) => {
    if (isSelecting) {
      // Completar selección y hacer zoom al área seleccionada
      const rect = containerRef.current.getBoundingClientRect();
      const startX = Math.min(selectionStart.x, selectionEnd.x);
      const endX = Math.max(selectionStart.x, selectionEnd.x);
      
      // Validar que hay una selección mínima
      if (endX - startX > 10) {
        const startPercent = startX / rect.width;
        const endPercent = endX / rect.width;
        const selectionWidth = endPercent - startPercent;
        
        if (selectionWidth > 0.001) { // Al menos 0.1% del ducto
          // Calcular nuevo zoom y pan
          const newZoom = Math.min(1 / selectionWidth, 1000); // Límite máximo de zoom
          const selectionCenter = (startPercent + endPercent) / 2;
          const currentCenter = 0.5;
          const panAdjustment = (currentCenter - selectionCenter) * newZoom * 100;
          
          // Aplicar zoom y centrado
          setZoom(newZoom);
          
          // Calcular el pan necesario para centrar la selección
          const maxPan = (newZoom - 1) * 50;
          const minPan = -maxPan;
          setPan(Math.max(minPan, Math.min(maxPan, panAdjustment)));
        }
      }
      
      setIsSelecting(false);
    } else {
      setIsDragging(false);
    }
  };

  // Resetear zoom y pan
  const resetView = () => {
    setZoom(1);
    setPan(0);
  };

  // Zoom a segmento específico
  const zoomToSegment = (segment) => {
    if (!segment) return;
    
    // Calcular la longitud del segmento
    const segmentLength = segment.length;
    const padding = segmentLength * 0.5; // 50% de padding a cada lado
    const totalViewLength = segmentLength + padding * 2;
    
    // Calcular el nuevo zoom
    const newZoom = Math.min(processedSegments.totalLength / totalViewLength, 1000);
    
    // Calcular la posición central del segmento en el ducto real
    const segmentCenter = segment.Begin + (segmentLength / 2);
    const ductoCenter = processedSegments.minPosition + (processedSegments.totalLength / 2);
    const offsetFromCenter = segmentCenter - ductoCenter;
    const newPan = -(offsetFromCenter / processedSegments.totalLength) * newZoom * 100;
    
    // Aplicar zoom y pan con límites
    setZoom(newZoom);
    const maxPan = (newZoom - 1) * 50;
    const minPan = -maxPan;
    setPan(Math.max(minPan, Math.min(maxPan, newPan)));
  };

  // Efectos para limpiar event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsSelecting(false);
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleSegmentMouseEnter = (segment, event) => {
    if (!isDragging && !isSelecting) {
      setHoveredSegment(segment);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleSegmentMouseLeave = () => {
    if (!isDragging && !isSelecting) {
      setHoveredSegment(null);
    }
  };

  const handleSegmentClick = (segment) => {
    if (!isDragging && !isSelecting) {
      setSelectedSegment(selectedSegment?.segmento === segment.segmento ? null : segment);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Generar leyenda de colores dinámica
  const colorLegend = useMemo(() => {
    if (processedSegments.maxFoF === processedSegments.minFoF || processedSegments.maxFoF === 0) {
      return [
        { color: '#6c757d', label: 'Sin datos', range: 'N/A' }
      ];
    }

    const { maxFoF, minFoF } = processedSegments;
    const logMax = Math.log10(maxFoF);
    const logMin = Math.log10(minFoF);
    const step = (logMax - logMin) / 4;

    return [
      { color: '#17a2b8', label: 'Muy Bajo', range: `${minFoF.toExponential(1)} - ${Math.pow(10, logMin + step).toExponential(1)}` },
      { color: '#28a745', label: 'Bajo', range: `${Math.pow(10, logMin + step).toExponential(1)} - ${Math.pow(10, logMin + step * 2).toExponential(1)}` },
      { color: '#ffc107', label: 'Medio', range: `${Math.pow(10, logMin + step * 2).toExponential(1)} - ${Math.pow(10, logMin + step * 3).toExponential(1)}` },
      { color: '#fd7e14', label: 'Alto', range: `${Math.pow(10, logMin + step * 3).toExponential(1)} - ${Math.pow(10, logMin + step * 4).toExponential(1)}` },
      { color: '#dc3545', label: 'Crítico', range: `≥ ${Math.pow(10, logMin + step * 4).toExponential(1)}` }
    ];
  }, [processedSegments.maxFoF, processedSegments.minFoF]);

  if (processedSegments.segments.length === 0) {
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
        <h2 className="text-2xl font-bold text-gray-800">
          {processedSegments.segments[0]?.Name || 'Pipeline'}
        </h2>
        <p className="text-gray-600">
          Longitud Total: {formatNumber(processedSegments.totalLength)}m | {processedSegments.segments.length} segmentos
        </p>
      </div>

      {/* Gráfico del ducto */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="relative">
          {/* Controles de zoom y pan con información detallada */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700">Modo:</span>
                  <button
                    onClick={() => setZoomMode('select')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      zoomMode === 'select' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📋 Seleccionar Área
                  </button>
                  <button
                    onClick={() => setZoomMode('pan')}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      zoomMode === 'pan' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🤏 Mover Vista
                  </button>
                </div>
                <button
                  onClick={resetView}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium"
                >
                  🔍 Vista Completa
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {zoomMode === 'select' ? 'Arrastra para seleccionar área' : 
                 isDragging ? 'Moviendo vista...' : 'Arrastra para mover la vista'}
              </div>
            </div>
            
            {/* Información detallada del zoom */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-500 text-xs uppercase tracking-wide">Zoom</div>
                <div className="font-bold text-lg text-blue-600">{zoomInfo.zoomPercentage.toFixed(0)}%</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-500 text-xs uppercase tracking-wide">Segmentos Visibles</div>
                <div className="font-bold text-lg text-green-600">{zoomInfo.visibleSegmentCount} / {zoomInfo.totalSegments}</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-500 text-xs uppercase tracking-wide">Longitud Visible</div>
                <div className="font-bold text-lg text-purple-600">{formatNumber(zoomInfo.visibleLength)}m</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-gray-500 text-xs uppercase tracking-wide">Vista (%)</div>
                <div className="font-bold text-lg text-orange-600">{zoomInfo.visiblePercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Escala superior dinámica */}
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>{formatNumber(zoomInfo.startPosition)}m</span>
            <span>Longitud Visible: {formatNumber(zoomInfo.visibleLength)}m</span>
            <span>{formatNumber(zoomInfo.endPosition)}m</span>
          </div>
          
          {/* Contenedor del ducto con zoom y pan */}
          <div 
            ref={containerRef}
            className={`relative h-20 mb-12 overflow-hidden select-none ${
              zoomMode === 'select' ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setHoveredSegment(null);
              setIsDragging(false);
              setIsSelecting(false);
            }}
          >
            {/* Ducto base con transformación */}
            <div 
              className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 rounded-lg shadow-lg transition-transform duration-100"
              style={{
                transform: `translateX(${pan}%) scaleX(${zoom})`,
                transformOrigin: 'left center'
              }}
            >
              {/* Efecto de brillo superior */}
              <div className="absolute top-1 left-4 right-4 h-4 bg-gradient-to-b from-gray-200 to-transparent rounded-t-lg opacity-70"></div>
              {/* Efecto de sombra inferior */}
              <div className="absolute bottom-1 left-4 right-4 h-4 bg-gradient-to-t from-gray-600 to-transparent rounded-b-lg opacity-50"></div>
            </div>
            
            {/* Segmentos del ducto con transformación */}
            <div
              className="absolute inset-0 transition-transform duration-100"
              style={{
                transform: `translateX(${pan}%) scaleX(${zoom})`,
                transformOrigin: 'left center'
              }}
            >
              {processedSegments.segments.map((segment, index) => (
                <div key={`segment-${segment.segmento}-${index}`}>
                  {/* Línea divisoria simple */}
                  <div
                    className="absolute top-0 bottom-0 bg-gray-700 opacity-50 pointer-events-none"
                    style={{
                      left: `${segment.relativeStart}%`,
                      width: '1px'
                    }}
                  ></div>
                  
                  {/* Área del segmento para hover y click */}
                  <div
                    className="absolute top-0 bottom-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200"
                    style={{
                      left: `${segment.relativeStart}%`,
                      width: `${segment.relativeEnd - segment.relativeStart}%`,
                      backgroundColor: hoveredSegment?.segmento === segment.segmento ? 
                        'rgba(0,0,0,0.1)' : 
                        selectedSegment?.segmento === segment.segmento ? 
                        'rgba(59, 130, 246, 0.2)' : 'transparent'
                    }}
                    onMouseEnter={(e) => handleSegmentMouseEnter(segment, e)}
                    onMouseLeave={handleSegmentMouseLeave}
                    onClick={() => handleSegmentClick(segment)}
                  >
                    {/* Indicador de riesgo basado en FoF */}
                    <div 
                      className="absolute bottom-0 h-2 w-full"
                      style={{
                        backgroundColor: getFofColor(segment.FoF),
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              
              {/* Línea divisoria final */}
              <div
                className="absolute top-0 bottom-0 bg-gray-700 opacity-50 pointer-events-none"
                style={{ 
                  right: '0%',
                  width: '1px'
                }}
              ></div>
            </div>

            {/* Rectángulo de selección */}
            {isSelecting && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none z-30"
                style={{
                  left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                  top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                  width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
                  height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
                }}
              ></div>
            )}
          </div>

          {/* Leyenda de colores FoF dinámica */}
          <div className="flex flex-wrap justify-center items-center gap-4 p-4 bg-gray-50 rounded-lg">
            {colorLegend.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-700">
                  {item.label} {item.range !== 'N/A' ? `(${item.range})` : ''}
                </span>
              </div>
            ))}
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
                style={{ backgroundColor: getFofColor(selectedSegment.FoF) }}
              ></div>
              <h3 className="text-2xl font-bold text-gray-800">
                Detalle del Segmento {selectedSegment.segmento}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => zoomToSegment(selectedSegment)}
                className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                🔍 Zoom al Segmento
              </button>
              <button
                onClick={() => setSelectedSegment(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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

            {/* FoF */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="text-sm text-red-600 font-medium mb-2">FoF (Frequency of Failure)</div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-red-800">{selectedSegment.FoF?.toExponential(2) || '0.00e+0'}</div>
                <div className="text-sm text-red-600">Factor de Falla</div>
                <div 
                  className="w-4 h-4 rounded mx-auto"
                  style={{ backgroundColor: getFofColor(selectedSegment.FoF) }}
                ></div>
              </div>
            </div>

            {/* Análisis */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-2">Análisis</div>
              <div className="space-y-2">
                <div><span className="font-medium">Begin:</span> {formatNumber(selectedSegment.Begin || 0)}</div>
                <div><span className="font-medium">End:</span> {formatNumber(selectedSegment.End || 0)}</div>
                <div><span className="font-medium">Segmento:</span> #{selectedSegment.segmento}</div>
              </div>
            </div>

            {/* Estado */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-2">Estado del Segmento</div>
              <div className="space-y-2">
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: getFofColor(selectedSegment.FoF) }}
                ></div>
                <div className="text-sm text-purple-600 text-center">
                  Riesgo por FoF
                </div>
                <div className="text-xs text-purple-500 text-center">
                  Analizado
                </div>
              </div>
            </div>
          </div>

          {/* Información técnica adicional */}
          {(selectedSegment.Name || selectedSegment.Begin || selectedSegment.End) && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Información Técnica</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {selectedSegment.Name && <div><span className="font-medium">Nombre:</span> {selectedSegment.Name}</div>}
                <div><span className="font-medium">Begin:</span> {formatNumber(selectedSegment.Begin || 0)}m</div>
                <div><span className="font-medium">End:</span> {formatNumber(selectedSegment.End || 0)}m</div>
                <div><span className="font-medium">FoF:</span> {selectedSegment.FoF?.toExponential(6) || '0.000000e+0'}</div>
              </div>
            </div>
          )}
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
              <div><span className="font-medium">Nombre:</span> {hoveredSegment.Name || 'Sin nombre'}</div>
              <div><span className="font-medium">Posición:</span> {formatNumber(hoveredSegment.Begin || 0)}m - {formatNumber(hoveredSegment.End || 0)}m</div>
              <div><span className="font-medium">Longitud:</span> {formatNumber(hoveredSegment.length)}m</div>
              <div>
                <span className="font-medium">FoF:</span> 
                <span className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: getFofColor(hoveredSegment.FoF), color: 'white' }}>
                  {hoveredSegment.FoF?.toExponential(2) || '0.00e+0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}