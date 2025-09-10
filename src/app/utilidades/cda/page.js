"use client";
import { useState } from "react";
import ParticipantesForm from "./participantes/page";
import CdaForm from "./CdaForm";
import CdaList from "./CdaList";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");

  return (
    <div>
      <header className="navbar">
        <h2 className="logo">Casa de Adolescentes</h2>
        <nav>
          <button onClick={() => setVista("participante")}>
            Agregar Participante
          </button>
          <button onClick={() => setVista("cda")}>
            Agregar Casa de Adolescentes
          </button>
          <button onClick={() => setVista("listado")}>
            Ver Casas de Adolescentes
          </button>
        </nav>
      </header>

      <main className="contenido">
        {vista === "inicio" && (
          <p>Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú.</p>
        )}
        {vista === "participante" && <ParticipantesForm />}
        {vista === "cda" && <CdaForm />}
        {vista === "listado" && <CdaList />}
      </main>
    </div>
  );
}
