"use client";
import { useState, useEffect } from "react";
// Importar `supabase` de la ruta correcta
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantesForm() {
  const initialForm = {
    nombre_participante: "",
    edad: "",
    sexo: "Masculino",
    barrio: "",
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
  const [loading, setLoading] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Función para cargar participantes
  const cargarParticipantes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("participantes")
        .select("*")
        .order('nombre_participante', { ascending: true });

      if (error) {
        console.error("Error cargando participantes:", error);
        alert("Error cargando participantes: " + error.message);
        return;
      }

      setParticipantes(data || []);
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado cargando participantes");
    } finally {
      setLoading(false);
    }
  };

  // Función para ver detalles de un participante
  const verDetalles = async (participante) => {
    try {
      // Buscar si tiene acudiente
      const { data: relacion, error: errorRel } = await supabase
        .from("participante_acudiente")
        .select("id_acudiente")
        .eq("id_participante", participante.id_participante)
        .single();

      let acudienteData = null;
      
      if (!errorRel && relacion) {
        const { data: acud, error: errorAcud } = await supabase
          .from("acudientes")
          .select("*")
          .eq("id_acudiente", relacion.id_acudiente)
          .single();
        
        if (!errorAcud && acud) {
          acudienteData = acud;
        }
      }

      setSelectedParticipante({
        ...participante,
        acudiente: acudienteData
      });
      setShowDetails(true);
    } catch (err) {
      console.error("Error obteniendo detalles:", err);
      alert("Error obteniendo detalles del participante");
    }
  };

  // Función para eliminar participante
  const eliminarParticipante = async (id_participante) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este participante?")) {
      return;
    }

    try {
      // Primero eliminar la relación con acudiente si existe
      await supabase
        .from("participante_acudiente")
        .delete()
        .eq("id_participante", id_participante);

      // Luego eliminar el participante
      const { error } = await supabase
        .from("participantes")
        .delete()
        .eq("id_participante", id_participante);

      if (error) {
        console.error("Error eliminando participante:", error);
        alert("Error eliminando participante: " + error.message);
        return;
      }

      alert("Participante eliminado exitosamente");
      cargarParticipantes(); // Recargar la lista
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado eliminando participante");
    }
  };

  // Cargar participantes al montar el componente
  useEffect(() => {
    cargarParticipantes();
  }, []);

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
      cargarParticipantes(); // Recargar la lista
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado: " + (err.message || JSON.stringify(err)));
    }
  };

  // Estilos consistentes con CdaForm.js
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

  const buttonSuccess = {
    ...buttonPrimary,
    backgroundColor: "#28a745"
  };

  const buttonDanger = {
    ...buttonPrimary,
    backgroundColor: "#dc3545",
    minWidth: "auto",
    padding: "8px 12px"
  };

  const buttonInfo = {
    ...buttonPrimary,
    backgroundColor: "#17a2b8",
    minWidth: "auto",
    padding: "8px 12px"
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

  const subHeaderStyle = {
    color: "#555",
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "16px"
  };

  const listItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    marginBottom: "8px",
    border: "1px solid #e9ecef"
  };

  const modalStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    position: "relative"
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={headerStyle}>Añadir Participante</h2>
        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <div style={formGroupStyle}>
              <label htmlFor="nombre_participante" style={labelStyle}>Nombre:</label>
              <input 
                id="nombre_participante" 
                name="nombre_participante" 
                value={formData.nombre_participante} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="edad" style={labelStyle}>Edad:</label>
              <input 
                id="edad" 
                type="number" 
                name="edad" 
                value={formData.edad} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="sexo" style={labelStyle}>Sexo:</label>
              <select 
                id="sexo" 
                name="sexo" 
                value={formData.sexo} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="barrio" style={labelStyle}>Barrio:</label>
              <input 
                id="barrio" 
                name="barrio" 
                value={formData.barrio} 
                onChange={handleChange} 
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="fecha_nacimiento" style={labelStyle}>Fecha de nacimiento:</label>
              <input 
                id="fecha_nacimiento" 
                type="date" 
                name="fecha_nacimiento" 
                value={formData.fecha_nacimiento} 
                onChange={handleChange} 
                required 
                style={inputStyle}
              />
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="bautizado" style={labelStyle}>Bautizado:</label>
              <select 
                id="bautizado" 
                name="bautizado" 
                value={formData.bautizado} 
                onChange={handleChange} 
                style={inputStyle}
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
            
            <div style={formGroupStyle}>
              <label htmlFor="rol" style={labelStyle}>Rol:</label>
              <select 
                id="rol" 
                name="rol" 
                value={formData.rol} 
                onChange={handleChange} 
                style={inputStyle}
              >
                <option value="Tropa">Tropa</option>
                <option value="Capitan">Capitán</option>
                <option value="Valiente de David">Valiente de David</option>
                <option value="Intendente">Intendente</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="necesitaAcudiente" style={labelStyle}>¿Necesita acudiente?</label>
              <select 
                id="necesitaAcudiente" 
                value={necesitaAcudiente} 
                onChange={(e) => setNecesitaAcudiente(e.target.value)} 
                style={inputStyle}
              >
                <option value="">Seleccione...</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          
          <div style={{...formGroupStyle, display: "flex", alignItems: "center", gap: "10px"}}>
            <label htmlFor="destacado" style={{ ...labelStyle, marginBottom: 0 }}>Destacado:</label>
            <input 
              id="destacado" 
              type="checkbox" 
              name="destacado" 
              checked={formData.destacado} 
              onChange={handleChange} 
              style={{ transform: "scale(1.2)" }}
            />
          </div>

          {necesitaAcudiente === "si" && (
            <div style={cardStyle}>
              <h4 style={subHeaderStyle}>Datos del Acudiente</h4>
              <div style={gridStyle}>
                <div style={formGroupStyle}>
                  <label htmlFor="nombre_acudiente" style={labelStyle}>Nombre del acudiente:</label>
                  <input 
                    id="nombre_acudiente" 
                    name="nombre_acudiente" 
                    value={acudiente.nombre_acudiente} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    style={inputStyle}
                  />
                </div>
                
                <div style={formGroupStyle}>
                  <label htmlFor="parentezco" style={labelStyle}>Parentesco:</label>
                  <input 
                    id="parentezco" 
                    name="parentezco" 
                    value={acudiente.parentezco} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    style={inputStyle}
                  />
                </div>
                
                <div style={formGroupStyle}>
                  <label htmlFor="celular" style={labelStyle}>Celular:</label>
                  <input 
                    id="celular" 
                    name="celular" 
                    value={acudiente.celular} 
                    onChange={handleAcudienteChange} 
                    required={necesitaAcudiente === "si"} 
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          )}
          
          <button type="submit" style={buttonSuccess}>
            Guardar
          </button>
        </form>
      </div>

      {/* Lista de Participantes */}
      <div style={cardStyle}>
        <h3 style={subHeaderStyle}>Lista de Participantes</h3>
        
        {loading ? (
          <p>Cargando participantes...</p>
        ) : participantes.length === 0 ? (
          <p>No hay participantes registrados.</p>
        ) : (
          <div>
            {participantes.map((participante) => (
              <div key={participante.id_participante} style={listItemStyle}>
                <div>
                  <strong>{participante.nombre_participante}</strong>
                  <span style={{ marginLeft: "10px", color: "#666" }}>
                    {participante.edad} años - {participante.rol}
                    {participante.destacado && <span style={{ color: "#f39c12", marginLeft: "5px" }}>⭐</span>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => verDetalles(participante)}
                    style={buttonInfo}
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => eliminarParticipante(participante.id_participante)}
                    style={buttonDanger}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {showDetails && selectedParticipante && (
        <div style={modalStyle} onClick={() => setShowDetails(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999"
              }}
            >
              ×
            </button>
            
            <h3 style={subHeaderStyle}>Detalles del Participante</h3>
            
            <div style={gridStyle}>
              <div><strong>Nombre:</strong> {selectedParticipante.nombre_participante}</div>
              <div><strong>Edad:</strong> {selectedParticipante.edad} años</div>
              <div><strong>Sexo:</strong> {selectedParticipante.sexo}</div>
              <div><strong>Barrio:</strong> {selectedParticipante.barrio || "No especificado"}</div>
              <div><strong>Fecha de nacimiento:</strong> {selectedParticipante.fecha_nacimiento}</div>
              <div><strong>Bautizado:</strong> {selectedParticipante.bautizado}</div>
              <div><strong>Rol:</strong> {selectedParticipante.rol}</div>
              <div><strong>Destacado:</strong> {selectedParticipante.destacado ? "Sí ⭐" : "No"}</div>
            </div>

            {selectedParticipante.acudiente && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={subHeaderStyle}>Datos del Acudiente</h4>
                <div style={gridStyle}>
                  <div><strong>Nombre:</strong> {selectedParticipante.acudiente.nombre_acudiente}</div>
                  <div><strong>Parentesco:</strong> {selectedParticipante.acudiente.parentezco}</div>
                  <div><strong>Celular:</strong> {selectedParticipante.acudiente.celular}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}