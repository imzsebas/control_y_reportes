"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantesForm() {
  const initialForm = {
    nombre_participante: "",
    edad: "",
    sexo: "Masculino",     // coincide con CHECK
    barrio: "",
    fecha_nacimiento: "",
    bautizado: "No",       // coincide con CHECK
    destacado: false,
    rol: "Tropa"           // coincide con CHECK
  };

  const [formData, setFormData] = useState(initialForm);
  const [necesitaAcudiente, setNecesitaAcudiente] = useState(""); // "" | "si" | "no"
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

    // Validación mínima en cliente (evita enviar strings vacíos donde se espera int)
    if (!formData.nombre_participante.trim()) return alert("Nombre requerido");
    if (formData.edad === "" || isNaN(Number(formData.edad)))
      return alert("Edad válida requerida");
    if (!formData.fecha_nacimiento) return alert("Fecha de nacimiento requerida");

    // Preparamos el payload con los tipos y valores exactos:
    const payload = {
      nombre_participante: formData.nombre_participante.trim(),
      edad: parseInt(formData.edad, 10),
      sexo: formData.sexo, // "Masculino" | "Femenino"
      barrio: formData.barrio.trim() || null,
      fecha_nacimiento: formData.fecha_nacimiento, // "YYYY-MM-DD" proveniente de <input type="date">
      bautizado: formData.bautizado, // "Si" | "No"
      destacado: formData.destacado, // boolean
      rol: formData.rol // "Tropa" | "Capitan" | "Valiente de David" | "Intendente"
      // id_acudiente no lo incluimos aquí (se añadirá si creamos acudiente luego)
    };

    try {
      // Insert participante
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

      // Si necesita acudiente, insertarlo y crear relación
      if (necesitaAcudiente === "si") {
        // validación simple de acudiente
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

        // Relación participante_acudiente
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

      // Reset estado
      setFormData(initialForm);
      setAcudiente({ nombre_acudiente: "", parentezco: "", celular: "" });
      setNecesitaAcudiente("");
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Error inesperado: " + (err.message || JSON.stringify(err)));
    }
  };

  // Estilos inline simples para que los labels siempre se vean (puedes mover a CSS)
  const fieldStyle = { display: "flex", flexDirection: "column", marginBottom: 12, maxWidth: 420 };

  return (
    <div style={{ padding: 12 }}>
      <h3>Añadir Participante</h3>
      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label htmlFor="nombre_participante">Nombre:</label>
          <input id="nombre_participante" name="nombre_participante" value={formData.nombre_participante} onChange={handleChange} required />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="edad">Edad:</label>
          <input id="edad" type="number" name="edad" value={formData.edad} onChange={handleChange} required />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="sexo">Sexo:</label>
          <select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="barrio">Barrio:</label>
          <input id="barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="fecha_nacimiento">Fecha de nacimiento:</label>
          <input id="fecha_nacimiento" type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="bautizado">Bautizado:</label>
          <select id="bautizado" name="bautizado" value={formData.bautizado} onChange={handleChange}>
            <option value="Si">Sí</option>
            <option value="No">No</option>
          </select>
        </div>

        <div style={{ ...fieldStyle, flexDirection: "row", alignItems: "center" }}>
          <label htmlFor="destacado" style={{ marginRight: 8 }}>Destacado:</label>
          <input id="destacado" type="checkbox" name="destacado" checked={formData.destacado} onChange={handleChange} />
        </div>

        <div style={fieldStyle}>
          <label htmlFor="rol">Rol:</label>
          <select id="rol" name="rol" value={formData.rol} onChange={handleChange}>
            <option value="Tropa">Tropa</option>
            <option value="Capitan">Capitan</option>
            <option value="Valiente de David">Valiente de David</option>
            <option value="Intendente">Intendente</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label htmlFor="necesitaAcudiente">¿Necesita acudiente?</label>
          <select id="necesitaAcudiente" value={necesitaAcudiente} onChange={(e) => setNecesitaAcudiente(e.target.value)}>
            <option value="">Seleccione...</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </div>

        {necesitaAcudiente === "si" && (
          <div style={{ border: "1px solid #ddd", padding: 8, marginBottom: 12, maxWidth: 420 }}>
            <h4>Datos del Acudiente</h4>

            <div style={fieldStyle}>
              <label htmlFor="nombre_acudiente">Nombre del acudiente:</label>
              <input id="nombre_acudiente" name="nombre_acudiente" value={acudiente.nombre_acudiente} onChange={handleAcudienteChange} required={necesitaAcudiente === "si"} />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="parentezco">Parentesco:</label>
              <input id="parentezco" name="parentezco" value={acudiente.parentezco} onChange={handleAcudienteChange} required={necesitaAcudiente === "si"} />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="celular">Celular:</label>
              <input id="celular" name="celular" value={acudiente.celular} onChange={handleAcudienteChange} required={necesitaAcudiente === "si"} />
            </div>
          </div>
        )}

        <button className="boton" type="submit">Guardar</button>
      </form>
    </div>
  );
}

