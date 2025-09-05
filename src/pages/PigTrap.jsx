// pages/Cracking.jsx
import { useLocation } from "react-router-dom";

export default function Cracking() {
  const location = useLocation();
  const [resultado] = location.state || [{}]; // Toma el primer resultado del state

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Resultados Cracking</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl overflow-auto">
        <pre className="whitespace-pre-wrap text-gray-700">{JSON.stringify(resultado, null, 2)}</pre>
      </div>
    </div>
  );
}
