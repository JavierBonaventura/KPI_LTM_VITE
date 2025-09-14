// pages/Cracking.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import GraficaDucto from "./GraficaDucto"

export default function Cracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { segmentos = 0, SumaFOF = 0, datos = [] } = location.state || [];

  // Nombre del segmento (si hay datos, tomamos el Name del primero)
  const segmentoNombre = datos[0]?.Name || "Sin nombre";

  // Calcular el largo del ducto (valor End más grande)
  const largoDucto =
    datos.length > 0 ? Math.max(...datos.map((item) => item.End || 0)) : 0;

  // Datos por segmento
  const categories = datos.map((_, index) => `Segmento ${index + 1}`);
  const fofData = datos.map((item, index) => ({
    y: item.FoF || 0,
    begin: item.Begin,
    end: item.End,
    segmento: index + 1,
  }));

  // Configuración Highcharts para gráfico por segmento
  const optionsSegmentos = {
    chart: { type: "column" },
    title: { text: "FoF por Segmento" },
    xAxis: { categories, title: { text: "Segmentos" } },
    yAxis: {
      title: { text: "FoF" },
      labels: {
        formatter: function () {
          return this.value.toExponential();
        },
      },
    },
    tooltip: {
      formatter: function () {
        const { y, begin, end, segmento } = this.point;
        return `
          <b>Segmento ${segmento}</b><br/>
          FoF: ${y.toExponential()}<br/>
          Begin: ${Math.round(begin)}<br/>
          End: ${Math.round(end)}
        `;
      },
    },
    series: [{ name: "FoF", data: fofData, color: "#4F46E5" }],
    credits: { enabled: false },
  };

  // Configuración Highcharts para gráfico total
  const optionsTotal = {
    chart: { type: "column" },
    title: { text: "FoF Total" },
    xAxis: { categories: ["Total"], title: { text: "" } },
    yAxis: {
      title: { text: "FoF" },
      labels: {
        formatter: function () {
          return this.value.toExponential();
        },
      },
    },
    tooltip: {
      formatter: function () {
        return `<b>Total</b><br/>FoF Total: ${this.y.toExponential()}`;
      },
    },
    series: [{ name: "FoF Total", data: [SumaFOF], color: "#10B981" }],
    credits: { enabled: false },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Dashboard de Monitoreo - Cracking
          </h1>
          <p className="mt-2 text-gray-500">
            Sistema de análisis y visualización de FoF por segmento
          </p>
        </div>

        {/* Panel de información del ducto */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Información del Ducto</h2>
          </div>
          
          <div className="p-6">
            {/* Estado de la selección */}
            <div className="p-4 bg-gray-50 rounded-lg border mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {segmentoNombre}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  Analizado
                </span>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Segmentos */}
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Segmentos</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{segmentos}</p>
                    <p className="text-sm text-gray-500">Segmentos analizados</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Largo del ducto */}
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Largo del Ducto</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {Math.round(largoDucto).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">metros</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Suma FoF */}
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">FoF Total</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {SumaFOF.toExponential()}
                    </p>
                    <p className="text-sm text-gray-500">FoF acumulado</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Análisis por segmento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Análisis por Segmento</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {segmentos} segmentos
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <HighchartsReact highcharts={Highcharts} options={optionsSegmentos} />
          </div>
        </div>

        {/* Resumen general */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Resumen General</h3>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                Total
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <HighchartsReact highcharts={Highcharts} options={optionsTotal} />
          </div>
        </div>

{/* INICIO ESTO QUIERO QUE ME DES */}
          <div className="mb-8">
                  {" "}
  <GraficaDucto datos={datos} />
                </div>
                {/* FIN ESTO QUIERO QUE ME DES */}


        {/* Información */}
        <div className="rounded-lg p-4 border border-green-200" style={{background: 'linear-gradient(to top, rgba(38, 92, 79, 0.1), rgba(22, 54, 46, 0.05))'}}>
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-green-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-green-900">Análisis Completado</h4>
              <p className="text-sm text-green-800 mt-1">
                El análisis de cracking ha sido completado exitosamente. Los resultados muestran la distribución 
                del Factor de Falla (FoF) a lo largo de los segmentos del ducto {segmentoNombre}.
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
                <svg className="w-5 h-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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