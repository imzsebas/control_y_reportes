"use client";
import { useState, useEffect } from "react";
import ParticipantesForm from "./participantes/page";
import CdaForm from "../../../components/CdaForm/CdaForm";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // Estilos consistentes con CdaForm.js
  const headerStyle = {
    backgroundColor: "#212529",
    color: "white",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    position: "relative" // Añadido para posicionar el menú desplegable
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

  const hamburgerStyle = {
    fontSize: "24px",
    cursor: "pointer",
    display: isMobile ? "block" : "none" // Muestra solo en móvil
  };
  
  const navContainerStyle = {
    display: isMobile ? (isMenuOpen ? "flex" : "none") : "flex", // Muestra en móvil solo si está abierto
    flexDirection: isMobile ? "column" : "row",
    position: isMobile ? "absolute" : "static",
    top: isMobile ? "100%" : "auto",
    right: isMobile ? "0" : "auto",
    backgroundColor: isMobile ? "#212529" : "transparent",
    padding: isMobile ? "16px" : "0",
    borderRadius: isMobile ? "0 0 8px 8px" : "0",
    boxShadow: isMobile ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
    gap: isMobile ? "12px" : "8px",
    width: isMobile ? "200px" : "auto",
    zIndex: 10
  };

  return (
    <div>
      <header style={headerStyle}>
        <h2 style={{ fontWeight: "bold" }}>Casa de Adolescentes</h2>
        <button onClick={toggleMenu} style={hamburgerStyle}>
          &#9776;
        </button>
        <nav style={navContainerStyle}>
          <button
            onClick={() => {
              setVista("participante");
              setIsMenuOpen(false);
            }}
            style={navButtonStyle}
          >
            Agregar Participante
          </button>
          <button
            onClick={() => {
              setVista("cda");
              setIsMenuOpen(false);
            }}
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