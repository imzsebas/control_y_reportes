"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import CdaParticipantes from "./CdaParticipantes";

export default function CdaList() {
  const [cdaList, setCdaList] = useState([]);
  const [selectedCda, setSelectedCda] = useState(null);
  const [siembra, setSiembra] = useState("");

  // cargar CDA
  useEffect(() => {
    fetchCda();
  }, []);

  const fetchCda = async () => {
    const { data, error } = await supabase.from("cda").select("*");
    if (error) {
      console.error("Error cargando CDA:", error);
    } else {
      setCdaList(data);
    }
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from("cda")
      .update({ siembra: parseInt(siembra, 10) })
      .eq("id_cda", id);

    if (error) {
      alert("Error actualizando CDA");
      console.error(error);
    } else {
      alert("CDA actualizado con éxito");
      fetchCda();
      setSiembra("");
    }
  };

  return (
    <div>
      <h3>Listado de Casas de Adolescentes</h3>
      <ul>
        {cdaList.map((cda) => (
          <li key={cda.id_cda}>
            <p>
              <b>Inicio:</b> {cda.fecha_inicio} | <b>Fin:</b>{" "}
              {cda.fecha_termino} | <b>Siembra:</b>{" "}
              {cda.siembra !== null ? cda.siembra : "Sin registrar"}
            </p>

            {/* Campo para actualizar siembra */}
            <input
              type="number"
              placeholder="Nueva siembra"
              value={siembra}
              onChange={(e) => setSiembra(e.target.value)}
            />
            <button onClick={() => handleUpdate(cda.id_cda)}>Modificar</button>

            {/* Botón para abrir participantes */}
            <button onClick={() => setSelectedCda(cda.id_cda)}>
              Agregar Participantes
            </button>

            {selectedCda === cda.id_cda && (
              <CdaParticipantes id_cda={cda.id_cda} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
