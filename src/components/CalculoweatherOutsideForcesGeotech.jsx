// src/components/CalculoweatherOutsideForcesGeotech.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CalculoweatherOutsideForcesGeotech() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultado = location.state || []; // resultado = [ [...], [...], ... ]

  useEffect(() => {
    // Tomar el primer arreglo interno o un arreglo vacío
    const datos = Array.isArray(resultado[0]) ? resultado[0] : [];

    // Contar la cantidad de elementos dentro del arreglo interno
    const segmentos = datos.length;

    // Sumar todos los valores de FoF
    const SumaFOF = datos.reduce((acc, item) => acc + (item.FoF || 0), 0);

    // Preparar objeto con los resultados
    const resultadoConSegmentos = {
      segmentos,
      SumaFOF,
      datos
    };

    // Redirigir a /weatherOutsideForcesGeotech pasando los datos
    navigate("/weatherOutsideForcesGeotech", { state: resultadoConSegmentos });
  }, [resultado, navigate]);

  // No renderiza nada
  return null;
}
