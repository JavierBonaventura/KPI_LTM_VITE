import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function PipelineGraphic() {
  const location = useLocation();
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // Recibimos los datos del state o arreglo vacío
  const receivedHeatmap = location.state?.heatmapConDetalle || [];
  console.log("datos recibidos", receivedHeatmap)

  // Extraer todos los segmentos y calcular dimensiones
  const allSegments = useMemo(() => {
    const segments = [];
    receivedHeatmap.forEach(item => {
      if (item.Segmentos && item.Segmentos.length > 0) {
        segments.push(...item.Segmentos);
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

  // Función para obtener color según categoría
  const getCategoryColor = (category) => {
    const colors = {
      'A': '#dc2626', // rojo más intenso
      'B': '#ea580c', // naranja
      'C': '#ca8a04', // amarillo dorado
      'D': '#16a34a', // verde
      'E': '#2563eb'  // azul
    };
    return colors[category] || '#6b7280';
  };

  const handleMouseEnter = (segment, event) => {
    setHoveredSegment(segment);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event) => {
    if (hoveredSegment) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
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
        <h2 className="text-2xl font-bold text-gray-800">
          {allSegments[0]?.Name || 'Pipeline'}
        </h2>
        <p className="text-gray-600">
          Longitud: {formatNumber(pipelineData.totalLength)}m | {pipelineData.segments.length} segmentos
        </p>
      </div>

      {/* Gráfico del ducto */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="relative">
          {/* Escala superior */}
          <div className="flex justify-between text-sm text-gray-500 mb-3">
            <span>{formatNumber(pipelineData.minPosition)}m</span>
            <span>Longitud Total: {formatNumber(pipelineData.totalLength)}m</span>
            <span>{formatNumber(pipelineData.maxPosition)}m</span>
          </div>
          
          {/* Contenedor del ducto */}
          <div className="relative h-20 mb-12">
            {/* Ducto base con gradiente metálico */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500  shadow-lg">
              {/* Efecto de brillo superior */}
              <div className="absolute top-1 left-4 right-4 h-4 bg-gradient-to-b from-gray-200 to-transparent  opacity-70"></div>
              {/* Efecto de sombra inferior */}
              <div className="absolute bottom-1 left-4 right-4 h-4 bg-gradient-to-t from-gray-600 to-transparent  opacity-50"></div>
            </div>
            
            {/* Líneas divisorias de segmentos */}
            {pipelineData.segments.map((segment, index) => (
              <div key={`divider-${segment.segmento}-${index}`}>
                {/* Línea divisoria */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-700 z-10"
                  style={{
                    left: `${segment.relativeStart}%`,
                  }}
                ></div>
                
                {/* Área del segmento para hover */}
                <div
                  className="absolute top-0 bottom-0 cursor-pointer hover:bg-black hover:bg-opacity-10 transition-all duration-200"
                  style={{
                    left: `${segment.relativeStart}%`,
                    width: `${segment.relativeEnd - segment.relativeStart}%`,
                    backgroundColor: hoveredSegment?.segmento === segment.segmento ? 
                      'rgba(0,0,0,0.1)' : 'transparent'
                  }}
                  onMouseEnter={(e) => handleMouseEnter(segment, e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Indicador de categoría */}
                  <div 
                    className="absolute bottom-0 h-1 w-full"
                    style={{
                      backgroundColor: getCategoryColor(segment.Category),
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
      </div>

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
              <div><span className="font-medium">Categoría:</span> <span 
                className="px-2 py-1 rounded text-xs font-bold ml-2"
                style={{ backgroundColor: getCategoryColor(hoveredSegment.Category) }}
              >{hoveredSegment.Category}</span></div>
              <div><span className="font-medium">Consecuencia:</span> {hoveredSegment.Consequence}</div>
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