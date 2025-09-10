"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CdaForm() {
  const initialForm = {
    fecha_inicio: "",
    fecha_termino: "",
    siembra: null // se puede agregar después
  };

  const [formData, setFormData] = useState(initialForm);
  const [cdaList, setCdaList] = useState([]);
  const [editingCda, setEditingCda] = useState(null);
  const [participantes, setParticipantes] = useState([]);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState({});

  // Cargar todos los CDA
  const fetchCda = async () => {
    const { data, error } = await supabase.from("cda").select("*").order("fecha_inicio", { ascending: false });
    if (error) console.error(error);
    else setCdaList(data);
  };

  // Cargar participantes
  const fetchParticipantes = async () => {
    const { data, error } = await supabase.from("participantes").select("*").order("nombre_participante");
    if (error) console.error(error);
    else setParticipantes(data);
  };

  useEffect(() => {
    fetchCda();
    fetchParticipantes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCdaSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fecha_inicio || !formData.fecha_termino) {
      alert("Debes ingresar fechas de inicio y término");
      return;
    }

    try {
      let payload = {
        fecha_inicio: formData.fecha_inicio,
        fecha_termino: formData.fecha_termino,
        siembra: formData.siembra ? parseInt(formData.siembra, 10) : null
      };

      let result;
      if (editingCda) {
        // Modificar CDA existente
        const { data, error } = await supabase
          .from("cda")
          .update(payload)
          .eq("id_cda", editingCda);
        if (error) throw error;
        result = data;
      } else {
        // Agregar nuevo CDA
        const { data, error } = await supabase.from("cda").insert([payload]).select().single();
        if (error) throw error;
        result = data;
      }

      alert("Registro guardado exitosamente");
      setFormData(initialForm);
      setEditingCda(null);
      fetchCda();
    } catch (err) {
      console.error(err);
      alert("Error guardando CDA: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleEdit = (cda) => {
    setFormData({
      fecha_inicio: cda.fecha_inicio,
      fecha_termino: cda.fecha_termino,
      siembra: cda.siembra
    });
    setEditingCda(cda.id_cda);
  };

  // Manejar selección de participantes
  const handleParticipanteCheck = (id) => {
    setParticipantesSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAgregarParticipantes = async (id_cda) => {
    try {
      const registros = Object.entries(participantesSeleccionados)
        .filter(([_, asistio]) => asistio)
        .map(([id_participante, asistio]) => ({
          id_cda,
          id_participante: parseInt(id_participante, 10),
          asistio
        }));

      if (registros.length === 0) {
        alert("Selecciona al menos un participante");
        return;
      }

      const { error } = await supabase.from("cda_participantes").upsert(registros);
      if (error) throw error;

      alert("Participantes agregados correctamente");
      setParticipantesSeleccionados({});
    } catch (err) {
      console.error(err);
      alert("Error agregando participantes: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>{editingCda ? "Modificar Casa de Adolescentes" : "Agregar Casa de Adolescentes"}</h3>

      <form onSubmit={handleCdaSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Fecha de inicio:</label>
          <input type="datetime-local" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Fecha de término:</label>
          <input type="datetime-local" name="fecha_termino" value={formData.fecha_termino} onChange={handleChange} required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Siembra (opcional):</label>
          <input type="number" name="siembra" value={formData.siembra || ""} onChange={handleChange} />
        </div>

        <button type="submit">{editingCda ? "Actualizar" : "Guardar"}</button>
      </form>

      <h3 style={{ marginTop: 24 }}>Lista de Casas de Adolescentes</h3>
      {cdaList.map(cda => (
        <div key={cda.id_cda} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
          <div>Inicio: {cda.fecha_inicio}</div>
          <div>Término: {cda.fecha_termino}</div>
          <div>Siembra: {cda.siembra ?? "N/A"}</div>
          <button onClick={() => handleEdit(cda)}>Modificar</button>
          <button onClick={() => handleAgregarParticipantes(cda.id_cda)}>Agregar Participantes</button>

          <div style={{ marginTop: 8 }}>
            <h4>Participantes</h4>
            {participantes.map(p => (
              <div key={p.id_participante}>
                <label>
                  <input
                    type="checkbox"
                    checked={participantesSeleccionados[p.id_participante] || false}
                    onChange={() => handleParticipanteCheck(p.id_participante)}
                  />
                  {p.nombre_participante} ({p.edad} años)
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
