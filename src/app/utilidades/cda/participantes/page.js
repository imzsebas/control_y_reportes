"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ParticipantesForm.module.css"; 

export default function ParticipantesForm() {
  const initialForm = {
    nombre_participante: "",
    edad: "",
    sexo: "Masculino",
    barrio: "",
    telefono: "",
    fecha_nacimiento: "",
    bautizado: "No",
    destacado: false,
    rol: "Tropa"
  };

  const [formData, setFormData] = useState(initialForm);
  const [necesitaAcudiente, setNecesitaAcudiente] = useState("");
  const [acudiente, setAcudiente] = useState({
    nombre_acudiente: "",
    parentezco: "",
    celular: ""
  });
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' o 'edit'

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("participantes")
      .select(`
        *,
        participante_acudiente(acudientes(*))
      `)
      .order("nombre_participante", { ascending: true });

    if (error) {
      console.error("Error al obtener participantes:", error);
    } else {
      const mappedData = data.map(p => ({
        ...p,
        acudiente: p.participante_acudiente[0]?.acudientes || null
      }));
      setParticipantes(mappedData);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAcudienteChange = (e) => {
    const { name, value } = e.target;
    setAcudiente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre_participante.trim()) return alert("Nombre requerido");
    if (formData.edad === "" || isNaN(Number(formData.edad)))
      return alert("Edad válida requerida");
    if (!formData.fecha_nacimiento) return alert("Fecha de nacimiento requerida");

    const payload = {
      nombre_participante: formData.nombre_participante.trim(),
      edad: parseInt(formData.edad, 10),
      sexo: formData.sexo,
      barrio: formData.barrio.trim() || null,
      telefono: formData.telefono.trim() || null,
      fecha_nacimiento: formData.fecha_nacimiento,
      bautizado: formData.bautizado,
      destacado: formData.destacado,
      rol: formData.rol
    };

    try {
      const { data: participante, error: errPart } = await supabase
        .from("participantes")
        .insert([payload])
        .select()
        .single();

      if (errPart) {
        console.error("Error insertando participante:", errPart);
        alert("Error guardando participante: " + (errPart.message || JSON.stringify(errPart)));
        return;
      }

      if (necesitaAcudiente === "si") {
        if (!acudiente.nombre_acudiente.trim() || !acudiente.parentezco.trim() || !acudiente.celular.trim()) {
          alert("Completa los datos del acudiente");
          return;
        }

        const { data: acud, error: errorAc } = await supabase
          .from("acudientes")
          .insert([{
            nombre_acudiente: acudiente.nombre_acudiente.trim(),
            parentezco: acudiente.parentezco.trim(),
            celular: acudiente.celular.trim()
          }])
          .select()
          .single();

        if (errorAc) {
          console.error("Error insertando acudiente:", errorAc);
          alert("Error guardando acudiente: " + (errorAc.message || JSON.stringify(errorAc)));
          return;
        }

        const { error: relError } = await supabase
          .from("participante_acudiente")
          .insert([{
            id_participante: participante.id_participante,
            id_acudiente: acud.id_acudiente
          }]);

        if (relError) {
          console.error("Error creando relación participante_acudiente:", relError);
          alert("Error creando relación con acudiente: " + (relError.message || JSON.stringify(relError)));
          return;
        }
      }

      alert("Registro completado con éxito");
      setFormData(initialForm);
      setAcudiente({ nombre_acudiente: "", parentezco: "", celular: "" });
      setNecesitaAcudiente("");
      fetchParticipantes();
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado: " + (err.message || JSON.stringify(err)));
    }
  };

  const eliminarParticipante = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este participante?")) {
      const { error } = await supabase
        .from("participantes")
        .delete()
        .eq("id_participante", id);

      if (error) {
        console.error("Error eliminando participante:", error);
        alert("Error al eliminar el participante.");
      } else {
        alert("Participante eliminado con éxito.");
        fetchParticipantes();
      }
    }
  };
  
  const verDetalles = (participante) => {
    setSelectedParticipante(participante);
    setIsModalOpen(true);
    setModalMode("view");
  };

  const handleEdit = () => {
    setModalMode("edit");
    setFormData({
      nombre_participante: selectedParticipante.nombre_participante,
      edad: selectedParticipante.edad,
      sexo: selectedParticipante.sexo,
      barrio: selectedParticipante.barrio,
      telefono: selectedParticipante.telefono,
      fecha_nacimiento: selectedParticipante.fecha_nacimiento,
      bautizado: selectedParticipante.bautizado,
      destacado: selectedParticipante.destacado,
      rol: selectedParticipante.rol
    });
    if (selectedParticipante.acudiente) {
      setAcudiente({
        nombre_acudiente: selectedParticipante.acudiente.nombre_acudiente,
        parentezco: selectedParticipante.acudiente.parentezco,
        celular: selectedParticipante.acudiente.celular
      });
      setNecesitaAcudiente("si");
    } else {
      setAcudiente({ nombre_acudiente: "", parentezco: "", celular: "" });
      setNecesitaAcudiente("no");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.nombre_participante.trim()) return alert("Nombre requerido");

    const payload = {
      nombre_participante: formData.nombre_participante.trim(),
      edad: parseInt(formData.edad, 10),
      sexo: formData.sexo,
      barrio: formData.barrio.trim() || null,
      telefono: formData.telefono.trim() || null,
      fecha_nacimiento: formData.fecha_nacimiento,
      bautizado: formData.bautizado,
      destacado: formData.destacado,
      rol: formData.rol
    };

    try {
      const { error: updateError } = await supabase
        .from("participantes")
        .update(payload)
        .eq("id_participante", selectedParticipante.id_participante);

      if (updateError) throw updateError;

      const { error: relError } = await supabase
        .from("participante_acudiente")
        .delete()
        .eq("id_participante", selectedParticipante.id_participante);
        
      if (relError) throw relError;

      if (necesitaAcudiente === "si") {
        if (!acudiente.nombre_acudiente.trim() || !acudiente.parentezco.trim() || !acudiente.celular.trim()) {
          alert("Completa los datos del acudiente");
          return;
        }

        const { data: acud, error: errorAc } = await supabase
          .from("acudientes")
          .insert([{
            nombre_acudiente: acudiente.nombre_acudiente.trim(),
            parentezco: acudiente.parentezco.trim(),
            celular: acudiente.celular.trim()
          }])
          .select()
          .single();

        if (errorAc) throw errorAc;

        const { error: newRelError } = await supabase
          .from("participante_acudiente")
          .insert([{
            id_participante: selectedParticipante.id_participante,
            id_acudiente: acud.id_acudiente
          }]);

        if (newRelError) throw newRelError;
      }

      alert("Participante actualizado con éxito.");
      setIsModalOpen(false);
      fetchParticipantes();
      setModalMode("view");
    } catch (err) {
      console.error("Error actualizando participante:", err);
      alert("Error al actualizar: " + (err.message || JSON.stringify(err)));
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "No definida";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-CO");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedParticipante(null);
    setModalMode("view");
  };

  return (
    <div className={styles.participantesContainer}>
      <div className={styles.card}>
        <h2 className={styles.header}>Añadir Participante</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre_participante" className={styles.label}>Nombre:</label>
              <input 
                id="nombre_participante" 
                name="nombre_participante" 
                value={formData.nombre_participante} 
                onChange={handleChange} 
                required 
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="edad" className={styles.label}>Edad:</label>
              <input 
                id="edad" 
                type="number" 
                name="edad" 
                value={formData.edad} 
                onChange={handleChange} 
                required 
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="sexo" className={styles.label}>Sexo:</label>
              <select 
                id="sexo" 
                name="sexo" 
                value={formData.sexo} 
                onChange={handleChange} 
                required 
                className={styles.input}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="barrio" className={styles.label}>Barrio:</label>
              <input 
                id="barrio" 
                name="barrio" 
                value={formData.barrio} 
                onChange={handleChange} 
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telefono" className={styles.label}>Teléfono:</label>
              <input 
                id="telefono" 
                name="telefono" 
                value={formData.telefono} 
                onChange={handleChange} 
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="fecha_nacimiento" className={styles.label}>Fecha de nacimiento:</label>
              <input 
                id="fecha_nacimiento" 
                type="date" 
                name="fecha_nacimiento" 
                value={formData.fecha_nacimiento} 
                onChange={handleChange} 
                required 
                className={styles.input}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="bautizado" className={styles.label}>Bautizado:</label>
              <select 
                id="bautizado" 
                name="bautizado" 
                value={formData.bautizado} 
                onChange={handleChange} 
                className={styles.input}
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="rol" className={styles.label}>Rol:</label>
              <select 
                id="rol" 
                name="rol" 
                value={formData.rol} 
                onChange={handleChange} 
                className={styles.input}
              >
                <option value="Tropa">Tropa</option>
                <option value="Capitan">Capitán</option>
                <option value="Valiente de David">Valiente de David</option>
                <option value="Intendente">Intendente</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="necesitaAcudiente" className={styles.label}>¿Necesita acudiente?</label>
              <select 
                id="necesitaAcudiente" 
                value={necesitaAcudiente} 
                onChange={(e) => setNecesitaAcudiente(e.target.value)} 
                className={styles.input}
              >
                <option value="">Seleccione...</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          
          <div className={styles.checkboxGroup}>
            <label htmlFor="destacado" className={styles.label}>Destacado:</label>
            <input 
              id="destacado" 
              type="checkbox" 
              name="destacado" 
              checked={formData.destacado} 
              onChange={handleChange} 
              className={styles.checkbox}
            />
          </div>

          {necesitaAcudiente === "si" && (
            <div className={styles.acudienteCard}>
              <h4 className={styles.subHeader}>Datos del Acudiente</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre_acudiente" className={styles.label}>Nombre del acudiente:</label>
                  <input 
                    id="nombre_acudiente" 
                    name="nombre_acudiente" 
                    value={acudiente.nombre_acudiente} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="parentezco" className={styles.label}>Parentesco:</label>
                  <input 
                    id="parentezco" 
                    name="parentezco" 
                    value={acudiente.parentezco} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="celular" className={styles.label}>Celular:</label>
                  <input 
                    id="celular" 
                    name="celular" 
                    value={acudiente.celular} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          )}
          
          <button type="submit" className={styles.buttonSuccess}>
            Guardar
          </button>
        </form>
      </div>

      <section className={styles.card}>
        <h2 className={styles.header}>Lista de Participantes</h2>
        {loading ? (
          <p className={styles.loading}>Cargando participantes...</p>
        ) : participantes.length === 0 ? (
          <p className={styles.emptyState}>No hay participantes registrados.</p>
        ) : (
          <div className={styles.participantsList}>
            {participantes.map((p) => (
              <div key={p.id_participante} className={styles.participantItem}>
                <div>
                  <div className={styles.participantName}>
                    <strong>{p.nombre_participante}</strong>
                    {p.destacado && <span className={styles.destacadoIcon}>⭐</span>}
                  </div>
                  <div className={styles.participantDetails}>
                    {p.edad} años • {p.rol} • {p.sexo}
                  </div>
                </div>
                <div className={styles.participantActions}>
                  <button onClick={() => verDetalles(p)} className={styles.buttonDetails}>
                    Ver detalles
                  </button>
                  <button onClick={() => eliminarParticipante(p.id_participante)} className={styles.buttonDanger}>
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && selectedParticipante && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={closeModal} className={styles.closeButton}>X</button>
            <h3 className={styles.modalHeader}>Detalles del Participante</h3>
            
            {modalMode === "view" ? (
              <div className={styles.modalBody}>
                <p><strong>Nombre:</strong> {selectedParticipante.nombre_participante}</p>
                <p><strong>Edad:</strong> {selectedParticipante.edad}</p>
                <p><strong>Sexo:</strong> {selectedParticipante.sexo}</p>
                <p><strong>Teléfono:</strong> {selectedParticipante.telefono || "N/A"}</p>
                <p><strong>Barrio:</strong> {selectedParticipante.barrio || "N/A"}</p>
                <p><strong>Fecha de nacimiento:</strong> {formatearFecha(selectedParticipante.fecha_nacimiento)}</p>
                <p><strong>Bautizado:</strong> {selectedParticipante.bautizado}</p>
                <p><strong>Destacado:</strong> {selectedParticipante.destacado ? "Sí" : "No"}</p>
                <p><strong>Rol:</strong> {selectedParticipante.rol}</p>
                {selectedParticipante.acudiente && (
                  <>
                    <hr className={styles.divider} />
                    <h4 className={styles.subHeader}>Datos del Acudiente</h4>
                    <p><strong>Nombre:</strong> {selectedParticipante.acudiente.nombre_acudiente}</p>
                    <p><strong>Parentesco:</strong> {selectedParticipante.acudiente.parentezco}</p>
                    <p><strong>Celular:</strong> {selectedParticipante.acudiente.celular}</p>
                  </>
                )}
                <button onClick={handleEdit} className={styles.buttonPrimary} style={{ marginTop: '20px' }}>
                  Editar
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nombre:</label>
                    <input name="nombre_participante" value={formData.nombre_participante} onChange={handleChange} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Edad:</label>
                    <input type="number" name="edad" value={formData.edad} onChange={handleChange} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Sexo:</label>
                    <select name="sexo" value={formData.sexo} onChange={handleChange} className={styles.input}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Barrio:</label>
                    <input name="barrio" value={formData.barrio} onChange={handleChange} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Teléfono:</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Fecha de nacimiento:</label>
                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className={styles.input} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Bautizado:</label>
                    <select name="bautizado" value={formData.bautizado} onChange={handleChange} className={styles.input}>
                      <option value="Si">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Rol:</label>
                    <select name="rol" value={formData.rol} onChange={handleChange} className={styles.input}>
                      <option value="Tropa">Tropa</option>
                      <option value="Capitan">Capitán</option>
                      <option value="Valiente de David">Valiente de David</option>
                      <option value="Intendente">Intendente</option>
                    </select>
                  </div>
                </div>
                <div className={styles.checkboxGroup}>
                  <label className={styles.label}>Destacado:</label>
                  <input type="checkbox" name="destacado" checked={formData.destacado} onChange={handleChange} className={styles.checkbox} />
                </div>
                {necesitaAcudiente === "si" && (
                  <div className={styles.acudienteCard}>
                    <h4 className={styles.subHeader}>Datos del Acudiente</h4>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nombre del acudiente:</label>
                        <input name="nombre_acudiente" value={acudiente.nombre_acudiente} onChange={handleAcudienteChange} required className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Parentesco:</label>
                        <input name="parentezco" value={acudiente.parentezco} onChange={handleAcudienteChange} required className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Celular:</label>
                        <input name="celular" value={acudiente.celular} onChange={handleAcudienteChange} required className={styles.input} />
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                  <button type="button" onClick={() => setModalMode("view")} className={styles.buttonSecondary}>Cancelar</button>
                  <button type="submit" className={styles.buttonSuccess}>Guardar Cambios</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}