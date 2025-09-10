"use client";
import { useState } from "react";

export default function AgregarCda() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaTermino, setFechaTermino] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevoCda = {
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino,
      siembra: null, // por defecto null
    };

    try {
      const res = await fetch("/api/cda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoCda),
      });

      if (res.ok) {
        alert("Evento registrado correctamente ✅");
        setFechaInicio("");
        setFechaTermino("");
      } else {
        alert("Error al registrar evento ❌");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Agregar Casa de Adolescentes</h2>
      <form onSubmit={handleSubmit}>
        <label>Fecha inicio:</label>
        <input
          type="datetime-local"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />

        <label>Fecha término:</label>
        <input
          type="datetime-local"
          value={fechaTermino}
          onChange={(e) => setFechaTermino(e.target.value)}
          required
        />

        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
