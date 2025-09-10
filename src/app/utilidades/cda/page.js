"use client";
import { useState } from "react";
import ParticipantesForm from "./participantes/page";
import CdaForm from "./CdaForm";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");

  return (
    <div>
      <header className="navbar p-4 bg-gray-800 text-white flex justify-between items-center">
        <h2 className="logo font-bold">Casa de Adolescentes</h2>
        <nav className="space-x-2">
          <button
            onClick={() => setVista("participante")}
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Agregar Participante
          </button>
          <button
            onClick={() => setVista("cda")}
            style={botonStyle}
          >
            Agregar Casa de Adolescentes
          </button>
          <button
            onClick={() => setVista("cda")}
            style={botonStyle}
          >
            Ver Casas de Adolescentes
          </button>
        </nav>
      </header>

      <main className="contenido p-4">
        {vista === "inicio" && (
          <p className="text-gray-700">
            Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú.
          </p>
        )}
        {vista === "participante" && <ParticipantesForm />}
        {vista === "cda" && <CdaForm />}
        {/* Eliminamos CdaList para evitar errores */}
      </main>
    </div>
  );
}

// Estilo simple para los botones
const botonStyle = {
  marginLeft: 12,
  padding: "6px 12px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14
};
