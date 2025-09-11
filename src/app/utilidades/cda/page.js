"use client";
import { useState } from "react";
import ParticipantesForm from "./participantes/page";
import CdaForm from "./CdaForm";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");
  
  // Estilos consistentes con CdaForm.js
  const headerStyle = {
    backgroundColor: "#212529",
    color: "white",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  const navButtonStyle = {
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s"
  };

  const navButtonGreen = {
    ...navButtonStyle,
    backgroundColor: "#28a745"
  };

  const mainStyle = {
    padding: "16px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  return (
    <div>
      <header style={headerStyle}>
        <h2 style={{ fontWeight: "bold" }}>Casa de Adolescentes</h2>
        <nav style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setVista("participante")}
            style={navButtonStyle}
          >
            Agregar Participante
          </button>
          <button
            onClick={() => setVista("cda")}
            style={navButtonGreen}
          >
            Agregar / Ver Casas de Adolescentes
          </button>
        </nav>
      </header>

      <main style={mainStyle}>
        {vista === "inicio" && (
          <p style={{ color: "#495057", textAlign: "center", padding: "40px" }}>
            Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú.
          </p>
        )}
        {vista === "participante" && <ParticipantesForm />}
        {vista === "cda" && <CdaForm />}
      </main>
    </div>
  );
}