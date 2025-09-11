"use client";
import { useState } from "react";
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
    </div>
  );
}