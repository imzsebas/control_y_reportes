"use client";
import { useState } from "react";
import ParticipantesForm from "./participantes/page";
import CdaForm from "./CdaForm";
import CdaList from "./CdaList";

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
            className="bg-green-500 px-3 py-1 rounded"
          >
            Agregar Casa de Adolescentes
          </button>
          <button
            onClick={() => setVista("listado")}
            className="bg-purple-500 px-3 py-1 rounded"
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
        {vista === "listado" && <CdaList />}
      </main>
    </div>
  );
}
