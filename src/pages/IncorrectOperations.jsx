// pages/IncorrectOperations.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function IncorrectOperations() {
  const location = useLocation();
  const navigate = useNavigate();
  const { segmentos = 0, SumaFOF = 0, datos = [] } = location.state || [];

  // Nombre del segmento (si hay datos, tomamos el Name del primero)
  const segmentoNombre = datos[0]?.Name || "Sin nombre";

  // Calcular el largo del ducto (valor End más grande)
  const largoDucto = datos.length > 0 ? Math.max(...datos.map(item => item.End || 0)) : 0;

  // Datos por segmento
  const categories = datos.map((_, index) => `Segmento ${index + 1}`);
  const fofData = datos.map((item, index) => ({
    y: item.FoF || 0,
    begin: item.Begin,
    end: item.End,
    segmento: index + 1
  }));

  // Configuración Highcharts para gráfico por segmento
  const optionsSegmentos = {
    chart: { type: "column" },
    title: { text: "FoF por Segmento" },
    xAxis: { categories, title: { text: "Segmentos" } },
    yAxis: {
      title: { text: "FoF" },
      labels: { formatter: function () { return this.value.toExponential(); } }
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
      }
    },
    series: [{ name: "FoF", data: fofData, color: "#4F46E5" }],
    credits: { enabled: false }
  };

  // Configuración Highcharts para gráfico total
  const optionsTotal = {
    chart: { type: "column" },
    title: { text: "FoF Total" },
    xAxis: { categories: ["Total"], title: { text: "" } },
    yAxis: {
      title: { text: "FoF" },
      labels: { formatter: function () { return this.value.toExponential(); } }
    },
    tooltip: {
      formatter: function () {
        return `<b>Total</b><br/>FoF Total: ${this.y.toExponential()}`;
      }
    },
    series: [{ name: "FoF Total", data: [SumaFOF], color: "#10B981" }],
    credits: { enabled: false }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Dashboard de Monitoreo - IncorrectOperations
          </h1>
          <p className="mt-2 text-gray-500">
            Sistema de análisis y visualización de FoF por segmento
          </p>
        </div>

        {/* Dashboard de resumen mejorado */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl shadow-2xl mb-8 border border-slate-700">
          {/* Header del dashboard */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-600">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-white">Estado del Sistema</h2>
            </div>
            <div className="text-sm text-slate-300">
              {new Date().toLocaleString('es-ES')}
            </div>
          </div>

          {/* Nombre del ducto */}
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-white mb-2">{segmentoNombre}</h3>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-green-400 mx-auto rounded-full"></div>
          </div>

          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Segmentos */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{segmentos}</div>
              <div className="text-sm text-slate-400">Segmentos analizados</div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            {/* Largo del ducto */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{Math.round(largoDucto).toLocaleString()}</div>
              <div className="text-sm text-slate-400">Largo del ducto (m)</div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
            </div>

            {/* Suma FoF */}
            <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs text-green-400 font-medium">ACTIVO</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{SumaFOF.toExponential()}</div>
              <div className="text-sm text-slate-400">FoF Total acumulado</div>
              <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full animate-pulse" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico por segmento */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-500 mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-700">Análisis por Segmento</h3>
          </div>
          <HighchartsReact highcharts={Highcharts} options={optionsSegmentos} />
        </div>

        {/* Gráfico total */}
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-green-500 mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-700">Resumen General</h3>
          </div>
          <HighchartsReact highcharts={Highcharts} options={optionsTotal} />
        </div>
        
      </div>
        {/* Botón volver a la derecha */}
<div className="m-auto mt-8 flex justify-center max-w-7xl">
    <button
      className="px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold rounded-xl shadow-lg hover:from-slate-600 hover:to-slate-700 transition duration-300 transform hover:scale-105 cursor-pointer border border-slate-600"
      onClick={() => navigate("/")}
    >
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Volver</span>
      </div>
    </button>
  </div>
    </div>
  );
}