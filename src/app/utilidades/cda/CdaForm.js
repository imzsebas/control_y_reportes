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
  const [cdaList, setCdaList] = useState([
    { id_cda: 1, fecha_inicio: "2024-01-15T10:00", fecha_termino: "2024-01-15T18:00", siembra: 25 },
    { id_cda: 2, fecha_inicio: "2024-02-20T09:30", fecha_termino: null, siembra: 30 }
  ]);
  const [participantes, setParticipantes] = useState([]);
  const [openCda, setOpenCda] = useState(null);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState({});
  const [cdaParticipantes, setCdaParticipantes] = useState({});
  
  // Estados para manejo de vistas
  const [vista, setVista] = useState("lista");
  const [cdaSeleccionada, setCdaSeleccionada] = useState(null);
  
  // Estados para la tabla de participantes
  const [participantesDetallados, setParticipantesDetallados] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("nombre");
  const [ordenDireccion, setOrdenDireccion] = useState("asc");

  // Estados para editar siembra
  const [editandoSiembra, setEditandoSiembra] = useState(false);
  const [nuevaSiembra, setNuevaSiembra] = useState("");

  // Funciones para manejar siembra
  const handleModificarSiembra = () => {
    setEditandoSiembra(true);
    setNuevaSiembra(cdaSeleccionada.siembra || "");
  };

  const handleGuardarSiembra = async () => {
    try {
      // Aquí iría la lógica para guardar en la base de datos
      // const { error } = await supabase.from('cda').update({ siembra: nuevaSiembra }).eq('id_cda', cdaSeleccionada.id_cda);

      alert(`Siembra actualizada a: ${nuevaSiembra}`);
      setCdaList(prevList => prevList.map(cda =>
          cda.id_cda === cdaSeleccionada.id_cda ? { ...cda, siembra: parseInt(nuevaSiembra, 10) } : cda
      ));
      setCdaSeleccionada(prev => ({ ...prev, siembra: parseInt(nuevaSiembra, 10) }));
      setEditandoSiembra(false);
    } catch (error) {
      console.error("Error al actualizar siembra:", error);
      alert("Error al actualizar la siembra");
    }
  };

  const handleCancelarSiembra = () => {
    setEditandoSiembra(false);
    setNuevaSiembra("");
  };

  const fetchCda = async () => {
    // Aquí iría la lógica para obtener las CDA de tu base de datos
  };

  const fetchParticipantes = async () => {
    try {
      const { data, error } = await supabase
        .from('participantes')
        .select('*')
        .order('nombre_participante', { ascending: true });
        
      if (error) {
        console.error("Error al obtener participantes:", error);
        return;
      }
      setParticipantes(data);
    } catch (err) {
      console.error("Error inesperado al obtener participantes:", err);
    }
  };

  const fetchAllCdaParticipantes = async () => {
    setCdaParticipantes({
      1: [
        { id_participante: 1, nombre_participante: "Juan Pérez", edad: 16, sexo: "M", rol: "Tropa", destacado: false },
        { id_participante: 2, nombre_participante: "María González", edad: 17, sexo: "F", rol: "Capitan", destacado: true }
      ],
      2: [
        { id_participante: 3, nombre_participante: "Carlos López", edad: 15, sexo: "M", rol: "Valiente de David", destacado: false }
      ]
    });
  };

  useEffect(() => {
    fetchCda();
    fetchParticipantes();
    fetchAllCdaParticipantes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fecha_inicio) return alert("Fecha de inicio requerida");

    alert("CDA agregado");
    setFormData(initialForm);
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
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
  };

  const handleToggleParticipantes = (id_cda) => {
    if (openCda === id_cda) {
      setOpenCda(null);
      setParticipantesSeleccionados({});
    } else {
      setOpenCda(id_cda);
      fetchCdaParticipantes(id_cda);
      loadParticipantesSeleccionados(id_cda);
    }
  };

  const loadParticipantesSeleccionados = async (id_cda) => {
    try {
      // Obtener los participantes ya registrados para esta CDA
      const { data, error } = await supabase
        .from('cda_participantes')
        .select('id_participante')
        .eq('id_cda', id_cda);

      if (error) {
        console.error("Error al cargar participantes seleccionados:", error);
        return;
      }

      // Crear objeto con participantes ya registrados
      const seleccionados = {};
      data.forEach(item => {
        seleccionados[item.id_participante] = true;
      });
      
      setParticipantesSeleccionados(seleccionados);
    } catch (err) {
      console.error("Error inesperado al cargar participantes seleccionados:", err);
    }
  };

  // FUNCIÓN CORREGIDA: Aquí estaba el error principal
  const fetchCdaParticipantes = async (id_cda) => {
    try {
      // Consulta corregida - se eliminaron los comentarios que causaban el error de sintaxis
      const { data, error } = await supabase
        .from('cda_participantes')
        .select(`
          id_participante,
          participantes (
            id_participante,
            nombre_participante,
            edad,
            sexo,
            rol,
            destacado
          )
        `)
        .eq('id_cda', id_cda);

      if (error) {
        console.error("Error al obtener participantes de CDA:", error);
        return;
      }

      // Mapear los datos correctamente
      const participantesQueAsistieron = data.map(item => item.participantes);
      setParticipantesDetallados(participantesQueAsistieron);

    } catch (err) {
      console.error("Error inesperado al obtener participantes de CDA:", err);
    }
  };

  const handleParticipanteCheck = (id) => {
    setParticipantesSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // FUNCIÓN CORREGIDA: Manejo de duplicados
  const handleAgregarParticipantes = async (id_cda) => {
    try {
      // Obtener participantes ya registrados para evitar duplicados
      const { data: existentes, error: errorExistentes } = await supabase
        .from('cda_participantes')
        .select('id_participante')
        .eq('id_cda', id_cda);

      if (errorExistentes) {
        throw errorExistentes;
      }

      const idsExistentes = existentes.map(item => item.id_participante);

      // Filtrar solo participantes nuevos (no duplicados)
      const participantesToAdd = participantes
        .filter(p => 
          participantesSeleccionados[p.id_participante] && 
          !idsExistentes.includes(p.id_participante)
        )
        .map(p => ({
          id_cda: id_cda,
          id_participante: p.id_participante,
          asistio: true
        }));

      if (participantesToAdd.length === 0) {
        alert("No hay participantes nuevos seleccionados para guardar.");
        return;
      }

      // Insertar solo los participantes nuevos
      const { error } = await supabase
        .from('cda_participantes') 
        .insert(participantesToAdd);

      if (error) {
        throw error;
      }

      alert(`${participantesToAdd.length} asistencia(s) guardada(s) correctamente`);
      await fetchCdaParticipantes(id_cda); 
      setOpenCda(null);
      setParticipantesSeleccionados({});

    } catch (err) {
      console.error("Error al guardar asistencias:", err);
      alert("Hubo un error al guardar la asistencia: " + err.message);
    }
  };

  const toggleDestacado = async (id_participante, destacadoActual) => {
    try {
      const { error } = await supabase
        .from('participantes')
        .update({ destacado: !destacadoActual })
        .eq('id_participante', id_participante);

      if (error) {
        throw error;
      }

      // Actualizar el estado local
      setParticipantesDetallados(prev =>
        prev.map(p =>
          p.id_participante === id_participante
            ? { ...p, destacado: !destacadoActual }
            : p
        )
      );

      alert(`Participante ${!destacadoActual ? 'agregado a' : 'removido de'} destacados`);
    } catch (error) {
      console.error("Error al actualizar destacado:", error);
      alert("Error al actualizar el estado de destacado");
    }
  };

  const getParticipantesFiltradosYOrdenados = () => {
    let participantesFiltrados = participantesDetallados.filter(p => {
      const cumpleNombre = p.nombre_participante.toLowerCase().includes(filtroNombre.toLowerCase());
      const cumpleSexo = filtroSexo === "" || p.sexo === filtroSexo;
      const cumpleRol = filtroRol === "" || p.rol === filtroRol;
      return cumpleNombre && cumpleSexo && cumpleRol;
    });

    participantesFiltrados.sort((a, b) => {
      let valorA, valorB;
      
      switch(ordenarPor) {
        case "nombre":
          valorA = a.nombre_participante.toLowerCase();
          valorB = b.nombre_participante.toLowerCase();
          break;
        case "edad":
          valorA = a.edad;
          valorB = b.edad;
          break;
        case "sexo":
          valorA = a.sexo;
          valorB = b.sexo;
          break;
        case "rol":
          valorA = a.rol;
          valorB = b.rol;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return ordenDireccion === "asc" ? -1 : 1;
      if (valorA > valorB) return ordenDireccion === "asc" ? 1 : -1;
      return 0;
    });

    return participantesFiltrados;
  };

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

  const buttonSecondary = {
    ...buttonPrimary,
    backgroundColor: "#6c757d"
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

  const mobileGridStyle = {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "1fr"
  };

  const tableContainerStyle = {
    overflowX: "auto",
    marginTop: "16px",
    borderRadius: "8px",
    border: "1px solid #e1e5e9"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "white",
    minWidth: "600px"
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

  if (vista === "lista") {
    return (
      <div style={containerStyle}>
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

        <div style={cardStyle}>
          <h3 style={subHeaderStyle}>Listado de Casas de Adolescentes</h3>
          <div style={mobileGridStyle}>
            {cdaList.map(cda => (
              <div key={cda.id_cda} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                border: "1px solid #e1e5e9",
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <strong>CDA - {formatearFecha(cda.fecha_inicio)}</strong>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
                    {cda.siembra ? `Siembra: ${cda.siembra}` : "Sin siembra definida"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Participantes: {cdaParticipantes[cda.id_cda]?.length || 0}
                  </div>
                </div>
                <button 
                  onClick={() => verDetalles(cda)} 
                  style={buttonSuccess}
                >
                  Ver detalles
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (vista === "detalle" && cdaSeleccionada) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <h2 style={headerStyle}>CDA - {formatearFecha(cdaSeleccionada.fecha_inicio)}</h2>
            <button onClick={volverALista} style={buttonSecondary}>
              ← Volver a la lista
            </button>
          </div>

          <div style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            <div>
              <strong>Fecha inicio:</strong>
              <div style={{ color: "#666", fontSize: "14px" }}>
                {new Date(cdaSeleccionada.fecha_inicio).toLocaleString()}
              </div>
            </div>
            <div>
              <strong>Fecha término:</strong>
              <div style={{ color: "#666", fontSize: "14px" }}>
                {cdaSeleccionada.fecha_termino ? 
                  new Date(cdaSeleccionada.fecha_termino).toLocaleString() : 
                  "No definida"
                }
              </div>
            </div>
            <div>
              <strong>Siembra:</strong>
              <div style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>
                {editandoSiembra ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      type="number"
                      value={nuevaSiembra}
                      onChange={(e) => setNuevaSiembra(e.target.value)}
                      placeholder="Número de siembra"
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "14px",
                        width: "120px"
                      }}
                    />
                    <button
                      onClick={handleGuardarSiembra}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelarSiembra}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span>{cdaSeleccionada.siembra ?? "N/A"}</span>
                    <button
                      onClick={handleModificarSiembra}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer"
                      }}
                    >
                      Modificar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            onClick={() => handleToggleParticipantes(cdaSeleccionada.id_cda)} 
            style={buttonPrimary}
          >
            {openCda === cdaSeleccionada.id_cda ? "Cerrar gestión" : "Gestionar asistencias"}
          </button>
        </div>

        {openCda === cdaSeleccionada.id_cda && (
          <div style={cardStyle}>
            <h4 style={subHeaderStyle}>Marcar asistencias</h4>
            <div style={{
              display: "grid",
              gap: "8px",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              marginBottom: "16px"
            }}>
              {participantes.map(p => (
                <label key={p.id_participante} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                  border: "1px solid #e1e5e9",
                  borderRadius: "6px",
                  backgroundColor: participantesSeleccionados[p.id_participante] ? "#e8f5e8" : "#fff",
                  cursor: "pointer",
                  transition: "background-color 0.2s"
                }}>
                  <input
                    type="checkbox"
                    checked={participantesSeleccionados[p.id_participante] || false}
                    onChange={() => handleParticipanteCheck(p.id_participante)}
                    style={{ marginRight: "12px", transform: "scale(1.2)" }}
                  />
                  <div>
                    <div style={{ fontWeight: "500" }}>{p.nombre_participante}</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {p.edad} años • {p.rol}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleAgregarParticipantes(cdaSeleccionada.id_cda)}
              style={buttonSuccess}
            >
              Actualizar asistencias
            </button>
          </div>
        )}

        <div style={cardStyle}>
          <h4 style={subHeaderStyle}>Participantes que asistieron</h4>
          
          {participantesDetallados.length > 0 ? (
            <div>
              <div style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                marginBottom: "16px",
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px"
              }}>
                <div>
                  <label style={labelStyle}>Buscar nombre:</label>
                  <input
                    type="text"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    placeholder="Escribir nombre..."
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>Filtrar por sexo:</label>
                  <select
                    value={filtroSexo}
                    onChange={(e) => setFiltroSexo(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Filtrar por rol:</label>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Todos</option>
                    <option value="Tropa">Tropa</option>
                    <option value="Capitan">Capitán</option>
                    <option value="Valiente de David">Valiente de David</option>
                    <option value="Intendente">Intendente</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Ordenar por:</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                    >
                      <option value="nombre">Nombre</option>
                      <option value="edad">Edad</option>
                      <option value="sexo">Sexo</option>
                      <option value="rol">Rol</option>
                    </select>
                    <button
                      onClick={() => setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc")}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: "16px",
                        minWidth: "44px"
                      }}
                      title={`Ordenar ${ordenDireccion === "asc" ? "descendente" : "ascendente"}`}
                    >
                      {ordenDireccion === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>

              <div style={tableContainerStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e1e5e9",
                        fontSize: "14px",
                        width: "60px"
                      }}>⭐</th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e1e5e9",
                        fontSize: "14px"
                      }}>Nombre</th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e1e5e9",
                        fontSize: "14px",
                        width: "80px"
                      }}>Edad</th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e1e5e9",
                        fontSize: "14px",
                        width: "100px"
                      }}>Sexo</th>
                      <th style={{
                        padding: "12px",
                        textAlign: "left",
                        fontWeight: "600",
                        borderBottom: "2px solid #e1e5e9",
                        fontSize: "14px"
                      }}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getParticipantesFiltradosYOrdenados().map((p, index) => (
                      <tr key={p.id_participante} style={{
                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        transition: "background-color 0.2s"
                      }}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #e1e5e9" }}>
                          <button
                            onClick={() => toggleDestacado(p.id_participante, p.destacado)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              transition: "background-color 0.2s"
                            }}
                            title={p.destacado ? "Quitar destacado" : "Marcar como destacado"}
                          >
                            {p.destacado ? "⭐" : "☆"}
                          </button>
                        </td>
                        <td style={{
                          padding: "12px",
                          borderBottom: "1px solid #e1e5e9",
                          fontSize: "14px",
                          fontWeight: "500"
                        }}>{p.nombre_participante}</td>
                        <td style={{
                          padding: "12px",
                          borderBottom: "1px solid #e1e5e9",
                          fontSize: "14px"
                        }}>{p.edad}</td>
                        <td style={{
                          padding: "12px",
                          borderBottom: "1px solid #e1e5e9",
                          fontSize: "14px"
                        }}>{p.sexo === "M" ? "Masculino" : "Femenino"}</td>
                        <td style={{
                          padding: "12px",
                          borderBottom: "1px solid #e1e5e9",
                          fontSize: "14px"
                        }}>{p.rol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{
                marginTop: "12px",
                fontSize: "14px",
                color: "#666",
                textAlign: "center",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px"
              }}>
                Mostrando {getParticipantesFiltradosYOrdenados().length} de {participantesDetallados.length} participantes
              </div>
            </div>
          ) : (
            <div style={{
              padding: "40px",
              textAlign: "center",
              color: "#666",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px"
            }}>
              <p>📋 Ningún participante registrado aún</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}