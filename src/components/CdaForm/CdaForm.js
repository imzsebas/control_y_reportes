"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import CdaList from "./CdaList";
import CdaDetalle from "./CdaDetalle";

export default function CdaForm() {
  const initialForm = {
    fecha_inicio: "",
    fecha_termino: "",
    siembra: null,
  };

  const [formData, setFormData] = useState(initialForm);
  const [cdaListWithCounts, setCdaListWithCounts] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState({});
  const [participantesDetallados, setParticipantesDetallados] = useState([]);

  const [vista, setVista] = useState("lista");
  const [cdaSeleccionada, setCdaSeleccionada] = useState(null);
  const [openCda, setOpenCda] = useState(null);

  // filtros detalle - CORREGIR: valor inicial debe ser "nombre" no "nombre_participante"
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("nombre"); // CORREGIDO
  const [ordenDireccion, setOrdenDireccion] = useState("asc");

  // edición de siembra
  const [editandoSiembra, setEditandoSiembra] = useState(false);
  const [nuevaSiembra, setNuevaSiembra] = useState("");

  // ---------- FUNCIONES DE CRUD ----------
  const fetchAllCdaData = async () => {
    try {
      const { data: cdas, error: cdaError } = await supabase.from("cda").select("*");
      if (cdaError) throw cdaError;

      const cdasConConteo = await Promise.all(
        cdas.map(async (cda) => {
          const { count } = await supabase
            .from("cda_participantes")
            .select("id_participante", { count: "exact", head: true })
            .eq("id_cda", cda.id_cda);
          return { ...cda, participantes_count: count };
        })
      );

      setCdaListWithCounts(cdasConConteo);
    } catch (err) {
      console.error("Error al obtener CDA:", err);
    }
  };

  const fetchAllParticipantes = async () => {
    try {
      const { data, error } = await supabase.from("participantes").select("*");
      if (error) throw error;
      setParticipantes(data);
    } catch (err) {
      console.error("Error al obtener participantes:", err);
    }
  };

  const fetchCdaParticipantes = async (id_cda) => {
    try {
      const { data, error } = await supabase
        .from("cda_participantes")
        .select(
          `id_participante,
           participantes (
             id_participante,
             nombre_participante,
             edad,
             sexo,
             rol,
             destacado
           )`
        )
        .eq("id_cda", id_cda);
      if (error) throw error;

      const participantesQueAsistieron = data.map(item => item.participantes);
      setParticipantesDetallados(participantesQueAsistieron);
    } catch (err) {
      console.error("Error al obtener participantes de CDA:", err);
    }
  };

  // ---------- HANDLERS ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fecha_inicio) return alert("Fecha de inicio requerida");

    try {
      const { error } = await supabase.from("cda").insert([formData]).select();
      if (error) throw error;

      alert("CDA agregada correctamente");
      setFormData(initialForm);
      fetchAllCdaData();
    } catch (err) {
      alert("Error al guardar CDA: " + err.message);
    }
  };

  const handleEliminarCda = async (id_cda, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!confirm("¿Estás seguro de que deseas eliminar esta CDA? Esta acción no se puede deshacer.")) return;

    try {
      console.log("Eliminando relaciones de participantes..."); 
      
      // Primero eliminar las relaciones en cda_participantes
      const { error: errorRelaciones } = await supabase
        .from('cda_participantes')
        .delete()
        .eq('id_cda', id_cda);

      if (errorRelaciones) {
        console.error("Error al eliminar relaciones:", errorRelaciones);
        alert("Error al eliminar las relaciones de participantes. No se pudo completar la eliminación.");
        return;
      }

      console.log("Eliminando CDA...");

      // Luego eliminar la CDA
      const { error } = await supabase
        .from('cda')
        .delete()
        .eq('id_cda', id_cda);

      if (error) {
        console.error("Error al eliminar CDA:", error);
        throw error;
      }

      console.log("CDA eliminada exitosamente");
      alert("CDA eliminada correctamente");
      
      // Actualizar la lista
      await fetchAllCdaData();

    } catch (err) {
      console.error("Error completo al eliminar CDA:", err);
      alert("Hubo un error al eliminar la CDA: " + err.message);
    }
  };

  const verDetalles = (cda) => {
    setCdaSeleccionada(cda);
    setVista("detalle");
    fetchCdaParticipantes(cda.id_cda);
  };

  const volverALista = () => {
    setVista("lista");
    setCdaSeleccionada(null);
    setOpenCda(null);
    setParticipantesSeleccionados({});
    fetchAllCdaData();
  };

  // ---------- USE EFFECT ----------
  useEffect(() => {
    fetchAllCdaData();
    fetchAllParticipantes();
  }, []);

  // ---------- ESTILOS INLINE ORIGINALES ----------
  const containerStyle = {
    padding: "16px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  };

  const cardStyle = {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: "1px solid #e1e5e9"
  };

  const buttonPrimary = {
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "inline-block",
    textAlign: "center",
    minWidth: "120px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    boxSizing: "border-box"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#333",
    fontSize: "14px"
  };

  const formGroupStyle = {
    marginBottom: "16px"
  };

  const gridStyle = {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
  };

  const headerStyle = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "20px",
    borderBottom: "2px solid #0066cc",
    paddingBottom: "10px"
  };

  // ---------- RENDER ----------
  return (
    <div style={containerStyle}>
      {vista === "lista" && (
        <>
          <div style={cardStyle}>
            <h2 style={headerStyle}>Agregar Casa de Adolescentes</h2>
            <div>
              <div style={gridStyle}>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Fecha inicio *:</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Fecha término:</label>
                  <input
                    type="datetime-local"
                    name="fecha_termino"
                    value={formData.fecha_termino}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Siembra:</label>
                  <input
                    type="number"
                    name="siembra"
                    value={formData.siembra || ""}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="Número de siembra"
                  />
                </div>
              </div>
              <button type="button" onClick={handleSubmit} style={buttonPrimary}>
                Guardar CDA
              </button>
            </div>
          </div>

          <CdaList
            cdaList={cdaListWithCounts}
            verDetalles={verDetalles}
            handleEliminarCda={handleEliminarCda}
          />
        </>
      )}

      {vista === "detalle" && cdaSeleccionada && (
        <CdaDetalle
          cdaSeleccionada={cdaSeleccionada}
          volverALista={volverALista}
          participantes={participantes}
          participantesDetallados={participantesDetallados}
          participantesSeleccionados={participantesSeleccionados}
          setParticipantesSeleccionados={setParticipantesSeleccionados}
          fetchCdaParticipantes={fetchCdaParticipantes}
          fetchAllCdaData={fetchAllCdaData}
          openCda={openCda}
          setOpenCda={setOpenCda}
          filtroNombre={filtroNombre}
          setFiltroNombre={setFiltroNombre}
          filtroSexo={filtroSexo}
          setFiltroSexo={setFiltroSexo}
          filtroRol={filtroRol}
          setFiltroRol={setFiltroRol}
          ordenarPor={ordenarPor}
          setOrdenarPor={setOrdenarPor}
          ordenDireccion={ordenDireccion}
          setOrdenDireccion={setOrdenDireccion}
          editandoSiembra={editandoSiembra}
          setEditandoSiembra={setEditandoSiembra}
          nuevaSiembra={nuevaSiembra}
          setNuevaSiembra={setNuevaSiembra}
        />
      )}
    </div>
  );
}