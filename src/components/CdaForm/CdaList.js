import styles from "./CdaForm.module.css";

export default function CdaList({ cdaList, verDetalles, handleEliminarCda }) {
  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "No definida";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO");
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.subHeader}>Listado de Casas de Adolescentes</h3>
      <div className={styles.listContainer}>
        {cdaList.map((cda) => (
          <div key={cda.id_cda} className={styles.listItem}>
            <div>
              <strong>CDA - {formatearFecha(cda.fecha_inicio)}</strong>
              <div>{cda.siembra ? `Siembra: ${cda.siembra}` : "Sin siembra definida"}</div>
              <div>Participantes: {cda.participantes_count || 0}</div>
            </div>
            <div className={styles.actions}>
              <button onClick={() => verDetalles(cda)} className={styles.btnSuccess}>
                Ver detalles
              </button>
              <button
                onClick={(event) => handleEliminarCda(cda.id_cda, event)}
                className={styles.btnDanger}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
