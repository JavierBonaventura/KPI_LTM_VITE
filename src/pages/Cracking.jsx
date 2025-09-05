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
            Resultados Cracking
          </h1>
          <p className="mt-2 text-gray-500">
            Visualización de FoF por segmento y total.
          </p>
        </div>

        {/* Tarjeta superior con resumen */}
<div className="bg-white p-6 rounded-xl shadow-xl mb-8 flex items-center justify-between text-lg font-medium text-gray-700">
  {/* Información central */}
  <div className="flex flex-col items-center flex-1">
    {/* Nombre del segmento */}
    <div className="text-2xl font-bold text-gray-800 mb-2">{segmentoNombre}</div>

    {/* Valores de Segmentos y SumaFOF */}
    <div className="w-full flex justify-between px-8">
      <div><span className="font-bold">Segmentos:</span> {segmentos}</div>
      <div><span className="font-bold">Suma FoF:</span> {SumaFOF.toExponential()}</div>
    </div>
  </div>


</div>


        {/* Gráfico por segmento */}
        <div className="bg-white p-6 rounded-xl shadow-xl mb-8">
          <HighchartsReact highcharts={Highcharts} options={optionsSegmentos} />
        </div>

        {/* Gráfico total */}
        <div className="bg-white p-6 rounded-xl shadow-xl">
          <HighchartsReact highcharts={Highcharts} options={optionsTotal} />
        </div>
        
      </div>
        {/* Botón volver a la derecha */}
<div className="m-auto mt-8 flex justify-center max-w-7xl">
    <button
      className="px-6 py-3 bg-gradient-to-r from-[#276334] to-green-800 text-white font-bold rounded-lg shadow-md hover:from-green-800 hover:to-[#276334] transition duration-300 transform hover:scale-105 cursor-pointer"
      onClick={() => navigate("/")}
    >
      Volver
    </button>
  </div>
    </div>
  );
}
