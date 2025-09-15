import React, { useState, useMemo, useRef, useEffect } from "react";

// En tu archivo Cracking.jsx, agrega esta importación:
// import GraficaDucto from './ruta/al/componente/GraficaDucto';

export default function GraficaDucto({ datos = [] }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouseX, setLastMouseX] = useState(0);
  const containerRef = useRef(null);

  // Procesar datos de los segmentos
  const processedSegments = useMemo(() => {
    if (!datos || datos.length === 0) return { segments: [], totalLength: 0, minPosition: 0, maxPosition: 0 };
    
    const minPosition = Math.min(...datos.map(s => s.Begin || 0));
    const maxPosition = Math.max(...datos.map(s => s.End || 0));
    const totalLength = maxPosition - minPosition;
    
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
      maxPosition
    };
  }, [datos]);

  // Función para obtener color basado en FoF
  const getFofColor = (fofValue) => {
    const fof = fofValue || 0;
    if (fof >= 1e-2) return "#dc3545"; // Rojo - Alto riesgo
    if (fof >= 1e-3) return "#fd7e14"; // Naranja - Medio-alto
    if (fof >= 1e-4) return "#ffc107"; // Amarillo - Medio
    if (fof >= 1e-5) return "#28a745"; // Verde - Bajo
    return "#6c757d"; // Gris - Muy bajo
  };

  // Manejar zoom con scroll
  const handleWheel = (event) => {
    if (!containerRef.current) return;
    
    event.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = (event.clientX - rect.left) / rect.width;
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(10, zoom * zoomFactor));
    
    if (newZoom !== zoom) {
      // Ajustar pan para mantener el punto bajo el mouse centrado
      const panAdjust = centerX * (zoom - newZoom) * 100;
      setPan(Math.max(-newZoom * 50 + 50, Math.min(newZoom * 50 - 50, pan + panAdjust)));
      setZoom(newZoom);
    }
  };

  // Manejar inicio de arrastre
  const handleMouseDown = (event) => {
    setIsDragging(true);
    setLastMouseX(event.clientX);
  };

  // Manejar arrastre
  const handleMouseMove = (event) => {
    if (hoveredSegment && !isDragging) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
    
    if (isDragging && containerRef.current) {
      const deltaX = event.clientX - lastMouseX;
      const rect = containerRef.current.getBoundingClientRect();
      const panDelta = (deltaX / rect.width) * 100 / zoom;
      
      setPan(Math.max(-zoom * 50 + 50, Math.min(zoom * 50 - 50, pan + panDelta)));
      setLastMouseX(event.clientX);
    }
  };

  // Manejar fin de arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resetear zoom y pan
  const resetView = () => {
    setZoom(1);
    setPan(0);
  };

  // Efectos para limpiar event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleSegmentMouseEnter = (segment, event) => {
    if (!isDragging) {
      setHoveredSegment(segment);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleSegmentMouseLeave = () => {
    if (!isDragging) {
      setHoveredSegment(null);
    }
  };

  const handleSegmentClick = (segment) => {
    if (!isDragging) {
      setSelectedSegment(selectedSegment?.segmento === segment.segmento ? null : segment);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

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
          Longitud: {formatNumber(processedSegments.totalLength)}m | {processedSegments.segments.length} segmentos
        </p>
      </div>

      {/* Gráfico del ducto */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="relative">
          {/* Controles de zoom y pan */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Zoom: {(zoom * 100).toFixed(0)}%
              </div>
              <button
                onClick={() => setZoom(Math.min(10, zoom * 1.2))}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Zoom +
              </button>
              <button
                onClick={() => setZoom(Math.max(0.5, zoom * 0.8))}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Zoom -
              </button>
              <button
                onClick={resetView}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {isDragging ? 'Arrastrando...' : 'Scroll para zoom, arrastra para mover'}
            </div>
          </div>

          {/* Escala superior */}
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>{formatNumber(processedSegments.minPosition)}m</span>
            <span>Longitud Total: {formatNumber(processedSegments.totalLength)}m</span>
            <span>{formatNumber(processedSegments.maxPosition)}m</span>
          </div>
          
          {/* Contenedor del ducto con zoom y pan */}
          <div 
            ref={containerRef}
            className="relative h-20 mb-12 overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setHoveredSegment(null);
              setIsDragging(false);
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
                  {/* Línea divisoria */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10"
                    style={{
                      left: `${segment.relativeStart}%`,
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
                className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10"
                style={{ right: '0%' }}
              ></div>
            </div>
          </div>

          {/* Leyenda de colores FoF */}
          <div className="flex justify-center items-center space-x-6 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6c757d' }}></div>
              <span className="text-sm text-gray-700">Muy Bajo (&lt;1e-5)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#28a745' }}></div>
              <span className="text-sm text-gray-700">Bajo (1e-5 - 1e-4)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ffc107' }}></div>
              <span className="text-sm text-gray-700">Medio (1e-4 - 1e-3)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fd7e14' }}></div>
              <span className="text-sm text-gray-700">Alto (1e-3 - 1e-2)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc3545' }}></div>
              <span className="text-sm text-gray-700">Crítico (≥1e-2)</span>
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
                style={{ backgroundColor: getFofColor(selectedSegment.FoF) }}
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