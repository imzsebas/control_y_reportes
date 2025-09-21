"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import CdaList from "./CdaList";
import CdaDetalle from "./CdaDetalle";
import styles from "./CdaForm.module.css";

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

  // filtros detalle
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("nombre");
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

      setParticipantesDetallados(data.map((item) => item.participantes));
    } catch (err) {
      console.error("Error al obtener participantes:", err);
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
    if (!confirm("¿Eliminar CDA?")) return;

    try {
      await supabase.from("cda_participantes").delete().eq("id_cda", id_cda);
      await supabase.from("cda").delete().eq("id_cda", id_cda);

      alert("CDA eliminada");
      fetchAllCdaData();
    } catch (err) {
      alert("Error eliminando CDA: " + err.message);
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

  // ---------- RENDER ----------
  return (
    <div className={styles.container}>
      {vista === "lista" && (
        <>
          <div className={styles.card}>
            <h2 className={styles.header}>Agregar Casa de Adolescentes</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha inicio *:</label>
                <input
                  type="datetime-local"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha término:</label>
                <input
                  type="datetime-local"
                  name="fecha_termino"
                  value={formData.fecha_termino}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Siembra:</label>
                <input
                  type="number"
                  name="siembra"
                  value={formData.siembra || ""}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Número de siembra"
                />
              </div>
            </div>
            <button onClick={handleSubmit} className={styles.btnPrimary}>
              Guardar CDA
            </button>
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
