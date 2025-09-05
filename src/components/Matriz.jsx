import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/*
    Componente Matriz: Tiene tres partes principales:
    1. Procesa los resultados COF y FoF en segmentos. Genera las variables resultadoPorSegmentoCof y resultadoPorSegmentoFof.
    que es el agrupado de los segmentos que tienen el mismo inicio y fin y suma los valores de COF y FoF por segmento.
    2. Generar la variable heatmapConDetalle que es un array con 49 celdas (7x7) que contiene la cantidad de segmentos que cumplen con 
    cada intervalo de la matriz de COF vs FoF. Cada celda tiene un array con los segmentos que cumplen con esos valores.
    3. Renderiza la información en pantalla, mostrando los resultados procesados y un botón para ver el heatmap detallado.
*/

export default function Matriz() {
  const location = useLocation();
  const resultadoCof = location.state?.resultadoCof || [];
  const resultadoFof = location.state?.resultadoFof || [];
  ////////////////////////////////////////////////////////
  // Inicio Función para procesar resultados en segmentos
  ////////////////////////////////////////////////////////

  const procesarSegmentos = (resultados) => {
    if (!resultados.length)
      return { totalSegmentos: 0, beginMin: 0, endMax: 0, segmentos: [] };

    const segmentos = [];

    resultados.forEach((r) => {
      let segmentoExistente = segmentos.find(
        (s) => s.registros[0].Begin === r.Begin && s.registros[0].End === r.End
      );

      if (segmentoExistente) {
        segmentoExistente.registros.push(r);
        segmentoExistente.cofPorSegmento += r.Value;
        segmentoExistente.count += 1;
      } else {
        segmentos.push({
          segmento: segmentos.length + 1,
          registros: [r],
          cofPorSegmento: r.Value,
          count: 1,
        });
      }
    });

    const allBegins = resultados.map((r) => r.Begin);
    const allEnds = resultados.map((r) => r.End);

    return {
      totalSegmentos: segmentos.length,
      beginMin: Math.min(...allBegins),
      endMax: Math.max(...allEnds),
      segmentos,
    };
  };

  const resultadoPorSegmentoCof = procesarSegmentos(resultadoCof);
  const resultadoPorSegmentoFof = procesarSegmentos(resultadoFof);
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Fin Función para procesar resultados en segmentos. Salida en resultadoPorSegmentoCof y resultadoPorSegmentoFof
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Inicio Código para generar los datos para armar la matriz
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const findIntervalIndex = (value, intervals) =>
    intervals.findIndex((i) => value >= i.min && value < i.max);

  const generarHeatmapConDetalle = (
    resultadoPorSegmentoCof,
    resultadoPorSegmentoFof
  ) => {
    const FoFIntervals = [
      { min: -Infinity, max: 0.00001 }, // índice 0 → FoF muy bajo
      { min: 0.00001, max: 0.0001 }, // índice 1
      { min: 0.0001, max: 0.001 }, // índice 2
      { min: 0.001, max: 0.01 }, // índice 3
      { min: 0.01, max: 0.1 }, // índice 4
      { min: 0.1, max: 1 }, // índice 5
      { min: 1, max: Infinity }, // índice 6 → FoF muy alto
    ];

    const CoFIntervals = [
      { min: 1500000000, max: Infinity }, // índice 0 → CoF muy alto
      { min: 150000000, max: 1500000000 }, // índice 1
      { min: 150000, max: 150000000 }, // índice 2
      { min: 500000, max: 1500000 }, // índice 3
      { min: 40000, max: 500000 }, // índice 4
      { min: 4000, max: 40000 }, // índice 5
      { min: -Infinity, max: 4000 }, // índice 6 → CoF muy bajo
    ];

    // Inicializamos la matriz con todas las celdas
    const heatmap = [];
    for (let cofIndex = 0; cofIndex < CoFIntervals.length; cofIndex++) {
      for (let fofIndex = 0; fofIndex < FoFIntervals.length; fofIndex++) {
        heatmap.push({
          cofIndex,
          fofIndex,
          SegmentosCantidad: 0,
          Segmentos: [],
        });
      }
    }

    // Llenamos los segmentos en las celdas correspondientes
    resultadoPorSegmentoCof.segmentos.forEach((cofSegmento) => {
      const fofSegmento = resultadoPorSegmentoFof.segmentos.find(
        (f) =>
          f.registros[0].Begin === cofSegmento.registros[0].Begin &&
          f.registros[0].End === cofSegmento.registros[0].End
      );

      if (fofSegmento) {
        const cofTotal = cofSegmento.cofPorSegmento;
        const fofTotal =
          fofSegmento.cofPorSegmento ??
          fofSegmento.registros.reduce((sum, r) => sum + r.Value, 0);

        const cofIndex = findIntervalIndex(cofTotal, CoFIntervals);
        const fofIndex = findIntervalIndex(fofTotal, FoFIntervals);

        // Buscamos la celda correspondiente en el heatmap
        const celda = heatmap.find(
          (c) => c.cofIndex === cofIndex && c.fofIndex === fofIndex
        );

        if (celda) {
          celda.SegmentosCantidad++;
          celda.Segmentos.push({
            segmento: cofSegmento.segmento,
            cofTotal,
            fofTotal,
            ...cofSegmento.registros[0], // información general del segmento
          });
        }
      }
    });

    return heatmap;
  };

  const heatmapConDetalle = generarHeatmapConDetalle(
    resultadoPorSegmentoCof,
    resultadoPorSegmentoFof
  );

  const navigate = useNavigate();
  const handleVerHeatmap = () => {
    navigate("/heatmap", { state: { heatmapConDetalle } });
  };

  ///////////////////////////////////////////////////////////
  // Fin  Código para generar los datos para armar la matriz: Salida en heatmapConDetalle
  ////////////////////////////////////////////////////////

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Matriz de Resultados</h1>

      <h2 className="text-xl font-semibold mt-4">COF</h2>
      {resultadoCof.length ? (
        <>
          <p>Total registros COF: {resultadoCof.length}</p>
          <pre className="mt-2 max-h-[300px] overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(resultadoPorSegmentoCof, null, 2)}
          </pre>
        </>
      ) : (
        <p>No se encontraron resultados COF.</p>
      )}

      <h2 className="text-xl font-semibold mt-6">FoF</h2>
      {resultadoFof.length ? (
        <>
          <p>Total registros FoF: {resultadoFof.length}</p>
          <pre className="mt-2 max-h-[300px] overflow-auto bg-gray-100 p-4 rounded">
            {JSON.stringify(resultadoPorSegmentoFof, null, 2)}
          </pre>
        </>
      ) : (
        <p>No se encontraron resultados FoF.</p>
      )}

      <h2 className="text-xl font-semibold mt-6">Heatmap con detalle</h2>
      <pre className="mt-2 max-h-[500px] overflow-auto bg-gray-100 p-4 rounded">
        {JSON.stringify(heatmapConDetalle, null, 2)}
      </pre>
      <button
        onClick={handleVerHeatmap}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Ver Heatmap
      </button>
    </div>
  );
}
