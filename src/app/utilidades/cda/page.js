"use client";
import { useState } from "react";
import ParticipantesForm from "./participantes/page";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");

  return (
    <div>
      {/* Barra superior */}
      <header className="navbar">
        <h2 className="logo">Casa de Adolescentes</h2>
        <nav>
          <button onClick={() => setVista("participante")}>
            Añadir Participante
          </button>
        </nav>
      </header>

      {/* Contenido dinámico */}
      <main className="contenido">
        {vista === "inicio" && (
          <p>Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú.</p>
        )}
        {vista === "participante" && <ParticipantesForm />}
      </main>
    </div>
  );
}
