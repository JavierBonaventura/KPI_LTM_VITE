// pages/Cracking.jsx
import { useLocation, useNavigate } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function Cracking() {
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
            Dashboard de Monitoreo - Cracking
          </h1>
          <p className="mt-2 text-gray-500">
            Sistema de análisis y visualización de FoF por segmento
          </p>
        </div>

        {/* Dashboard de resumen mejorado */}







{/* Fondo principal con gradiente */}
<div className="min-h-screen  px-6" >
  <div className="max-w-7xl mx-auto">
    {/* Header */}

    {/* Dashboard de resumen */}
    <div className="bg-[#1f4239] p-6 rounded-lg shadow-md mb-8 border border-[#265c4f]">
      {/* Header del panel */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#265c4f]">
        <h2 className="text-lg font-medium text-white">Estado del Sistema</h2>
        <div className="text-xs text-gray-400">{new Date().toLocaleString('es-ES')}</div>
      </div>

      {/* Nombre del ducto */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold text-white">{segmentoNombre}</h3>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Segmentos */}
        <div className="bg-[#16362e] p-4 rounded-md border border-[#265c4f]">
          <div className="text-2xl font-bold text-white">{segmentos}</div>
          <div className="text-sm text-gray-400">Segmentos analizados</div>
        </div>

        {/* Largo del ducto */}
        <div className="bg-[#16362e] p-4 rounded-md border border-[#265c4f]">
          <div className="text-2xl font-bold text-white">{Math.round(largoDucto).toLocaleString()}</div>
          <div className="text-sm text-gray-400">Largo del ducto (m)</div>
        </div>

        {/* Suma FoF */}
        <div className="bg-[#16362e] p-4 rounded-md border border-[#265c4f]">
          <div className="text-2xl font-bold text-white">{SumaFOF.toExponential()}</div>
          <div className="text-sm text-gray-400">FoF Total acumulado</div>
        </div>
      </div>
    </div>

    {/* Gráfico por segmento */}
    <div className="bg-[#1f4239] p-6 rounded-lg shadow-md mb-8 border border-[#265c4f]">
      <h3 className="text-lg font-medium text-white mb-4">Análisis por Segmento</h3>
      <HighchartsReact highcharts={Highcharts} options={optionsSegmentos} />
    </div>

    {/* Gráfico total */}
    <div className="bg-[#1f4239] p-6 rounded-lg shadow-md border border-[#265c4f]">
      <h3 className="text-lg font-medium text-white mb-4">Resumen General</h3>
      <HighchartsReact highcharts={Highcharts} options={optionsTotal} />
    </div>
  </div>
</div>














        
      </div>
        {/* Botón volver a la derecha */}
<div className="m-auto mt-8 flex justify-center max-w-7xl">
  <button
    className="px-8 py-4 text-white font-semibold rounded-lg shadow-md 
               transition duration-300 transform hover:scale-105 cursor-pointer"
    style={{
      background: "linear-gradient(to bottom, #265c4f, #16362e)",
      border: "1px solid #265c4f"
    }}
    onClick={() => navigate("/")}
  >
    <div className="flex items-center space-x-2">
      <svg
        className="w-5 h-5 text-gray-200"
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
      <span>Volver</span>
    </div>
  </button>
</div>

    </div>
  );
}