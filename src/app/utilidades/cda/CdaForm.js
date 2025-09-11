"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CdaForm() {
  const initialForm = {
    fecha_inicio: "",
    fecha_termino: "",
    siembra: null
  };

  const [formData, setFormData] = useState(initialForm);
  const [cdaList, setCdaList] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [openCda, setOpenCda] = useState(null);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState({});
  const [cdaParticipantes, setCdaParticipantes] = useState({});

  // Cargar CDA existentes
  const fetchCda = async () => {
    const { data, error } = await supabase
      .from("cda")
      .select("*")
      .order("id_cda", { ascending: false });
    if (error) return console.error(error);
    setCdaList(data);
  };

  // Cargar participantes
  const fetchParticipantes = async () => {
    const { data, error } = await supabase.from("participantes").select("*");
    if (error) return console.error(error);
    setParticipantes(data);
  };

  useEffect(() => {
    fetchCda();
    fetchParticipantes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fecha_inicio) return alert("Fecha de inicio requerida");

    try {
      const { data, error } = await supabase
        .from("cda")
        .insert([{
          fecha_inicio: formData.fecha_inicio,
          fecha_termino: formData.fecha_termino || null,
          siembra: formData.siembra ? parseInt(formData.siembra, 10) : null
        }])
        .select()
        .single();

      if (error) throw error;

      alert("CDA agregado");
      setFormData(initialForm);
      fetchCda();
    } catch (err) {
      console.error(err);
      alert("Error agregando CDA: " + (err.message || JSON.stringify(err)));
    }
  };

  // Manejar abrir/cerrar checkbox
  const handleToggleParticipantes = (id_cda) => {
    if (openCda === id_cda) {
      setOpenCda(null);
      // Limpiar selecciones cuando se cierra
      setParticipantesSeleccionados({});
    } else {
      setOpenCda(id_cda);
      fetchCdaParticipantes(id_cda);
      // Cargar el estado actual de los checkboxes
      loadParticipantesSeleccionados(id_cda);
    }
  };

  // NUEVA FUNCIÓN: Cargar estado de checkboxes desde la BD
  const loadParticipantesSeleccionados = async (id_cda) => {
    const { data, error } = await supabase
      .from("cda_participantes")
      .select("id_participante, asistio")
      .eq("id_cda", id_cda);

    if (error) {
      console.error(error);
      return;
    }

    // Crear objeto con el estado de cada participante
    const seleccionados = {};
    data.forEach(item => {
      seleccionados[item.id_participante] = item.asistio;
    });

    setParticipantesSeleccionados(seleccionados);
  };

  // Cargar participantes confirmados (para mostrar en la lista)
  const fetchCdaParticipantes = async (id_cda) => {
    const { data, error } = await supabase
      .from("cda_participantes")
      .select("id_participante, asistio, participantes(nombre_participante)")
      .eq("id_cda", id_cda);

    if (error) return console.error(error);

    setCdaParticipantes(prev => ({
      ...prev,
      [id_cda]: data.filter(d => d.asistio).map(d => ({
        id_participante: d.id_participante,
        nombre_participante: d.participantes.nombre_participante
      }))
    }));
  };

  const handleParticipanteCheck = (id) => {
    setParticipantesSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAgregarParticipantes = async (id_cda) => {
    try {
      const registros = participantes.map(p => ({
        id_cda,
        id_participante: p.id_participante,
        asistio: participantesSeleccionados[p.id_participante] || false
      }));

      // Guardar todo en la base de datos usando upsert
      const { error } = await supabase
        .from("cda_participantes")
        .upsert(registros, { onConflict: ["id_cda", "id_participante"] });

      if (error) throw error;

      alert("Asistencia guardada correctamente");
      fetchCdaParticipantes(id_cda); // recargar lista de confirmados
      // NO limpiar las selecciones aquí para mantener el estado
    } catch (err) {
      console.error(err);
      alert("Error guardando asistencia: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>Agregar Casa de Adolescentes</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Fecha inicio:</label>
          <input type="datetime-local" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Fecha término:</label>
          <input type="datetime-local" name="fecha_termino" value={formData.fecha_termino} onChange={handleChange} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Siembra:</label>
          <input type="number" name="siembra" value={formData.siembra || ""} onChange={handleChange} />
        </div>
        <button type="submit" style={botonStyle}>Guardar CDA</button>
      </form>

      <h3>Listado de Casas de Adolescentes</h3>
      {cdaList.map(cda => (
        <div key={cda.id_cda} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
          <div>Inicio: {cda.fecha_inicio}</div>
          <div>Término: {cda.fecha_termino}</div>
          <div>Siembra: {cda.siembra ?? "N/A"}</div>
          <button onClick={() => handleToggleParticipantes(cda.id_cda)} style={{ marginTop: 4, ...botonStyle }}>
            Agregar Participantes
          </button>

          {openCda === cda.id_cda ? (
            <div style={{ marginTop: 8, borderTop: "1px solid #ddd", paddingTop: 8 }}>
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
              <button
                onClick={() => handleAgregarParticipantes(cda.id_cda)}
                style={{ marginTop: 8, padding: "4px 8px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: 4 }}
              >
                Hecho
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <h5>Asistieron:</h5>
              {cdaParticipantes[cda.id_cda]?.length > 0
                ? cdaParticipantes[cda.id_cda].map(p => <div key={p.id_participante}>{p.nombre_participante} ({p.edad} años)</div>)
                : <p>Ninguno aún</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Botón estilo simple
const botonStyle = {
  marginTop: 4,
  marginLeft: 0,
  padding: "6px 12px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14
};