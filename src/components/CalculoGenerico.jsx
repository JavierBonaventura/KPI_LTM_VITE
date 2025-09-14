// src/components/CalculoGenerico.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function CalculoGenerico() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resultado, config } = location.state || {};

  useEffect(() => {
    if (!resultado || !config) {
      console.error("Datos faltantes en CalculoGenerico");
      return;
    }

    // Tomar el primer arreglo interno o un arreglo vacío
    const datos = Array.isArray(resultado[0]) ? resultado[0] : [];

    // Contar la cantidad de elementos dentro del arreglo interno
    const segmentos = datos.length;

    // Sumar todos los valores de FoF (o el campo especificado en config)
    const sumaFOF = datos.reduce((acc, item) => {
      const valor = item[config.campoSuma] || 0;
      return acc + valor;
    }, 0);

    // Preparar objeto con los resultados usando la configuración
    const resultadoFinal = {
      segmentos,
      [config.nombreSuma]: sumaFOF,
      datos,
      // Agregar cualquier cálculo adicional si se especifica
      ...(config.calculosAdicionales && config.calculosAdicionales(datos))
    };

    // Redirigir a la ruta especificada en config
    navigate(config.rutaDestino, { state: resultadoFinal });
  }, [resultado, config, navigate]);

  // No renderiza nada
  return null;
}