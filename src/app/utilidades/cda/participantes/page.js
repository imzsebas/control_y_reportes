"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ParticipantesForm() {
  const [formData, setFormData] = useState({
    nombre_participante: "",
    edad: "",
    sexo: "masculino",
    barrio: "",
    fecha_nacimiento: "",
    bautizado: "no",
    destacado: false,
    rol: "Tropa"
  });

  const [necesitaAcudiente, setNecesitaAcudiente] = useState(null);
  const [acudiente, setAcudiente] = useState({
    nombre_acudiente: "",
    parentezco: "",
    celular: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAcudienteChange = (e) => {
    const { name, value } = e.target;
    setAcudiente({
      ...acudiente,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Insertar participante
    const { data: participante, error } = await supabase
      .from("participantes")
      .insert([formData])
      .select()
      .single();

    if (error) {
      alert("Error guardando participante");
      console.error(error);
      return;
    }

    // Si necesita acudiente
    if (necesitaAcudiente === "si") {
      const { data: acud, error: errorAc } = await supabase
        .from("acudientes")
        .insert([acudiente])
        .select()
        .single();

      if (errorAc) {
        alert("Error guardando acudiente");
        console.error(errorAc);
        return;
      }

      // Relación
      await supabase.from("participante_acudiente").insert([
        {
          id_participante: participante.id_participante,
          id_acudiente: acud.id_acudiente,
        },
      ]);
    }

    alert("Registro completado con éxito");
    setFormData({
      nombre_participante: "",
      edad: "",
      sexo: "masculino",
      barrio: "",
      fecha_nacimiento: "",
      bautizado: "no",
      destacado: false,
      rol: "Tropa"
    });
    setAcudiente({ nombre_acudiente: "", parentezco: "", celular: "" });
    setNecesitaAcudiente(null);
  };

  return (
    <div className="formulario">
      <h3>Añadir Participante</h3>
      <form onSubmit={handleSubmit}>
        <label>Nombre:</label>
        <input name="nombre_participante" value={formData.nombre_participante} onChange={handleChange} required />

        <label>Edad:</label>
        <input type="number" name="edad" value={formData.edad} onChange={handleChange} required />

        <select name="sexo" value={formData.sexo} onChange={handleChange}>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
        </select>

        <select name="bautizado" value={formData.bautizado} onChange={handleChange}>
        <option value="Si">Sí</option>
        <option value="No">No</option>
        </select>

        <select name="rol" value={formData.rol} onChange={handleChange}>
        <option value="Tropa">Tropa</option>
        <option value="Capitan">Capitan</option>
        <option value="Valiente de David">Valiente de David</option>
        <option value="Intendente">Intendente</option>
        </select>

        <label>¿Necesita acudiente?</label>
        <select onChange={(e) => setNecesitaAcudiente(e.target.value)}>
          <option value="">Seleccione...</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>

        {necesitaAcudiente === "si" && (
          <div>
            <h4>Datos del Acudiente</h4>
            <label>Nombre del acudiente:</label>
            <input name="nombre_acudiente" value={acudiente.nombre_acudiente} onChange={handleAcudienteChange} required />

            <label>Parentesco:</label>
            <input name="parentezco" value={acudiente.parentezco} onChange={handleAcudienteChange} required />

            <label>Celular:</label>
            <input name="celular" value={acudiente.celular} onChange={handleAcudienteChange} required />
          </div>
        )}

        <button className="boton" type="submit">Guardar</button>
      </form>
    </div>
  );
}
