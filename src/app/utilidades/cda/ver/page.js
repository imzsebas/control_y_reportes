"use client";
import { useEffect, useState } from "react";

export default function VerCda() {
  const [cdaList, setCdaList] = useState([]);

  useEffect(() => {
    fetch("/api/cda")
      .then((res) => res.json())
      .then((data) => setCdaList(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Lista de Casas de Adolescentes</h2>
      <ul>
        {cdaList.map((cda) => (
          <li key={cda.id_cda}>
            <strong>ID:</strong> {cda.id_cda} |{" "}
            <strong>Inicio:</strong> {cda.fecha_inicio} |{" "}
            <strong>Término:</strong> {cda.fecha_termino} |{" "}
            <strong>Siembra:</strong> {cda.siembra ?? "No asignada"}{" "}
            <button>Modificar</button>
            <button>Agregar Participantes</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
