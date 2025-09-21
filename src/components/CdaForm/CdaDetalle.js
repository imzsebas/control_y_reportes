"use client";
import { supabase } from "@/lib/supabaseClient";
import styles from "./CdaForm.module.css";

export default function CdaDetalle({
  cdaSeleccionada,
  volverALista,
  participantes,
  participantesDetallados,
  participantesSeleccionados,
  setParticipantesSeleccionados,
  fetchCdaParticipantes,
  fetchAllCdaData,
  openCda,
  setOpenCda,
  filtroNombre,
  setFiltroNombre,
  filtroSexo,
  setFiltroSexo,
  filtroRol,
  setFiltroRol,
  ordenarPor,
  setOrdenarPor,
  ordenDireccion,
  setOrdenDireccion,
  editandoSiembra,
  setEditandoSiembra,
  nuevaSiembra,
  setNuevaSiembra,
}) {
  // ------- Helpers -------
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "No definida";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO");
  };

  const getParticipantesFiltradosYOrdenados = () => {
    let filtrados = [...participantesDetallados];
    if (filtroNombre) {
      filtrados = filtrados.filter((p) =>
        p.nombre_participante.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }
    if (filtroSexo) {
      filtrados = filtrados.filter((p) => p.sexo === filtroSexo);
    }
    if (filtroRol) {
      filtrados = filtrados.filter((p) => p.rol === filtroRol);
    }
    return filtrados.sort((a, b) => {
      let valA = a[ordenarPor];
      let valB = b[ordenarPor];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return ordenDireccion === "asc" ? -1 : 1;
      if (valA > valB) return ordenDireccion === "asc" ? 1 : -1;
      return 0;
    });
  };

  // ------- Acciones -------
  const handleMarcarAsistencia = async (idParticipante, presente) => {
    try {
      const { error } = await supabase
        .from("cda_participantes")
        .upsert([
          {
            id_cda: cdaSeleccionada.id_cda,
            id_participante: idParticipante,
            presente,
          },
        ]);
      if (error) throw error;

      fetchCdaParticipantes(cdaSeleccionada.id_cda);
    } catch (err) {
      console.error("Error marcando asistencia:", err.message);
    }
  };

  const handleGuardarParticipantes = async () => {
    const seleccionadosIds = Object.keys(participantesSeleccionados).filter(
      (id) => participantesSeleccionados[id]
    );
    try {
      const { error } = await supabase.from("cda_participantes").insert(
        seleccionadosIds.map((id) => ({
          id_cda: cdaSeleccionada.id_cda,
          id_participante: parseInt(id),
          presente: false,
        }))
      );
      if (error) throw error;

      alert("Participantes guardados");
      setOpenCda(null);
      setParticipantesSeleccionados({});
      fetchCdaParticipantes(cdaSeleccionada.id_cda);
      fetchAllCdaData();
    } catch (err) {
      console.error("Error guardando participantes:", err.message);
    }
  };

  const handleEliminarParticipante = async (idParticipante) => {
    if (!confirm("¿Eliminar este participante del CDA?")) return;
    try {
      const { error } = await supabase
        .from("cda_participantes")
        .delete()
        .eq("id_cda", cdaSeleccionada.id_cda)
        .eq("id_participante", idParticipante);
      if (error) throw error;

      fetchCdaParticipantes(cdaSeleccionada.id_cda);
      fetchAllCdaData();
    } catch (err) {
      console.error("Error eliminando participante:", err.message);
    }
  };

  const handleActualizarSiembra = async () => {
    try {
      const { error } = await supabase
        .from("cda")
        .update({ siembra: nuevaSiembra })
        .eq("id_cda", cdaSeleccionada.id_cda);
      if (error) throw error;

      alert("Siembra actualizada");
      setEditandoSiembra(false);
      fetchAllCdaData();
    } catch (err) {
      console.error("Error actualizando siembra:", err.message);
    }
  };

  // ------- Render -------
  return (
    <div className={styles.card}>
      <div className={styles.detailHeader}>
        <h2 className={styles.header}>
          CDA - {formatearFecha(cdaSeleccionada.fecha_inicio)}
        </h2>
        <button onClick={volverALista} className={styles.btnSecondary}>
          ← Volver
        </button>
      </div>

      {/* Siembra */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Siembra:</label>
        {editandoSiembra ? (
          <>
            <input
              type="number"
              value={nuevaSiembra}
              onChange={(e) => setNuevaSiembra(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleActualizarSiembra} className={styles.btnPrimary}>
              Guardar
            </button>
            <button onClick={() => setEditandoSiembra(false)} className={styles.btnSecondary}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span>{cdaSeleccionada.siembra || "No definida"}</span>
            <button
              onClick={() => {
                setEditandoSiembra(true);
                setNuevaSiembra(cdaSeleccionada.siembra || "");
              }}
              className={styles.btnPrimary}
            >
              Editar
            </button>
          </>
        )}
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className={styles.input}
        />
        <select
          value={filtroSexo}
          onChange={(e) => setFiltroSexo(e.target.value)}
          className={styles.input}
        >
          <option value="">Todos</option>
          <option value="M">Hombres</option>
          <option value="F">Mujeres</option>
        </select>
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className={styles.input}
        >
          <option value="">Todos los roles</option>
          <option value="Líder">Líder</option>
          <option value="Miembro">Miembro</option>
        </select>
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          className={styles.input}
        >
          <option value="nombre_participante">Nombre</option>
          <option value="edad">Edad</option>
        </select>
        <button
          onClick={() =>
            setOrdenDireccion((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className={styles.btnSecondary}
        >
          {ordenDireccion === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Tabla de participantes */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Sexo</th>
            <th>Rol</th>
            <th>Asistencia</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {getParticipantesFiltradosYOrdenados().map((p) => (
            <tr key={p.id_participante}>
              <td>{p.nombre_participante}</td>
              <td>{p.edad}</td>
              <td>{p.sexo}</td>
              <td>{p.rol}</td>
              <td>
                <input
                  type="checkbox"
                  checked={p.presente || false}
                  onChange={(e) =>
                    handleMarcarAsistencia(p.id_participante, e.target.checked)
                  }
                />
              </td>
              <td>
                <button
                  onClick={() => handleEliminarParticipante(p.id_participante)}
                  className={styles.btnDanger}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Agregar participantes */}
      <div className={styles.participantes}>
        <h3 className={styles.subHeader}>Agregar participantes</h3>
        {participantes.map((p) => (
          <label key={p.id_participante} className={styles.participanteCheck}>
            <input
              type="checkbox"
              checked={participantesSeleccionados[p.id_participante] || false}
              onChange={(e) =>
                setParticipantesSeleccionados((prev) => ({
                  ...prev,
                  [p.id_participante]: e.target.checked,
                }))
              }
            />
            {p.nombre_participante} ({p.rol})
          </label>
        ))}
        <button onClick={handleGuardarParticipantes} className={styles.btnPrimary}>
          Guardar participantes
        </button>
      </div>
    </div>
  );
}
