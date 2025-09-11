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
  const [cdaList, setCdaList] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [openCda, setOpenCda] = useState(null);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState({});
  const [cdaParticipantes, setCdaParticipantes] = useState({});
  
  // Nuevos estados para manejo de vistas
  const [vista, setVista] = useState("lista"); // "lista" o "detalle"
  const [cdaSeleccionada, setCdaSeleccionada] = useState(null);
  
  // Estados para la tabla de participantes
  const [participantesDetallados, setParticipantesDetallados] = useState([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroSexo, setFiltroSexo] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [ordenarPor, setOrdenarPor] = useState("nombre"); // "nombre", "edad", "sexo", "rol"
  const [ordenDireccion, setOrdenDireccion] = useState("asc"); // "asc", "desc"

  // Cargar CDA existentes
  const fetchCda = async () => {
    const { data, error } = await supabase
      .from("cda")
      .select("*")
      .order("id_cda", { ascending: false });
    if (error) return console.error(error);
    setCdaList(data);
  };

  // Cargar participantes
  const fetchParticipantes = async () => {
    const { data, error } = await supabase.from("participantes").select("*");
    if (error) return console.error(error);
    setParticipantes(data);
  };

  // Cargar TODOS los participantes confirmados de TODOS los CDAs al inicio
  const fetchAllCdaParticipantes = async () => {
    const { data, error } = await supabase
      .from("cda_participantes")
      .select("id_cda, id_participante, participantes(nombre_participante, edad)")
      .eq("asistio", true);

    if (error) return console.error(error);

    // Agrupar por id_cda
    const groupedData = {};
    data.forEach(item => {
      if (!groupedData[item.id_cda]) {
        groupedData[item.id_cda] = [];
      }
      groupedData[item.id_cda].push({
        id_participante: item.id_participante,
        nombre_participante: item.participantes.nombre_participante,
        edad: item.participantes.edad
      });
    });

    setCdaParticipantes(groupedData);
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

    try {
      const { data, error } = await supabase
        .from("cda")
        .insert([{
          fecha_inicio: formData.fecha_inicio,
          fecha_termino: formData.fecha_termino || null,
          siembra: formData.siembra ? parseInt(formData.siembra, 10) : null
        }])
        .select()
        .single();

      if (error) throw error;

      alert("CDA agregado");
      setFormData(initialForm);
      fetchCda();
      fetchAllCdaParticipantes();
    } catch (err) {
      console.error(err);
      alert("Error agregando CDA: " + (err.message || JSON.stringify(err)));
    }
  };

  // Función para formatear fecha a DD-MM-AAAA
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
  };

  // Ver detalles de una CDA específica
  const verDetalles = (cda) => {
    setCdaSeleccionada(cda);
    setVista("detalle");
    // Cargar datos específicos de esta CDA
    fetchCdaParticipantes(cda.id_cda);
  };

  // Volver a la vista de lista
  const volverALista = () => {
    setVista("lista");
    setCdaSeleccionada(null);
    setOpenCda(null);
    setParticipantesSeleccionados({});
  };

  // Manejar abrir/cerrar checkbox
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

  // Cargar estado de checkboxes desde la BD
  const loadParticipantesSeleccionados = async (id_cda) => {
    const { data, error } = await supabase
      .from("cda_participantes")
      .select("id_participante, asistio")
      .eq("id_cda", id_cda);

    if (error) {
      console.error(error);
      return;
    }

    const seleccionados = {};
    data.forEach(item => {
      seleccionados[item.id_participante] = item.asistio;
    });

    setParticipantesSeleccionados(seleccionados);
  };

  // Cargar participantes confirmados para un CDA específico con datos detallados
  const fetchCdaParticipantes = async (id_cda) => {
    const { data, error } = await supabase
      .from("cda_participantes")
      .select(`
        id_participante, 
        asistio, 
        participantes(
          id_participante,
          nombre_participante, 
          edad, 
          sexo, 
          rol, 
          destacado
        )
      `)
      .eq("id_cda", id_cda);

    if (error) return console.error(error);

    // Filtrar solo los que asistieron y formatear datos
    const participantesQueAsistieron = data
      .filter(d => d.asistio)
      .map(d => ({
        id_participante: d.participantes.id_participante,
        nombre_participante: d.participantes.nombre_participante,
        edad: d.participantes.edad,
        sexo: d.participantes.sexo,
        rol: d.participantes.rol,
        destacado: d.participantes.destacado
      }));

    // Para la lista simple (mantener compatibilidad)
    setCdaParticipantes(prev => ({
      ...prev,
      [id_cda]: participantesQueAsistieron
    }));

    // Para la tabla detallada
    setParticipantesDetallados(participantesQueAsistieron);
  };

  const handleParticipanteCheck = (id) => {
    setParticipantesSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAgregarParticipantes = async (id_cda) => {
    try {
      const registros = participantes.map(p => ({
        id_cda,
        id_participante: p.id_participante,
        asistio: participantesSeleccionados[p.id_participante] || false
      }));

      const { error } = await supabase
        .from("cda_participantes")
        .upsert(registros, { onConflict: ["id_cda", "id_participante"] });

      if (error) throw error;

      alert("Asistencia guardada correctamente");
      fetchCdaParticipantes(id_cda);
      fetchAllCdaParticipantes();
    } catch (err) {
      console.error(err);
      alert("Error guardando asistencia: " + (err.message || JSON.stringify(err)));
    }
  };

  // Función para actualizar el estado destacado de un participante
  const toggleDestacado = async (id_participante, destacadoActual) => {
    try {
      const { error } = await supabase
        .from("participantes")
        .update({ destacado: !destacadoActual })
        .eq("id_participante", id_participante);

      if (error) throw error;

      // Recargar los datos para mostrar el cambio
      fetchCdaParticipantes(cdaSeleccionada.id_cda);
      fetchAllCdaParticipantes();
    } catch (err) {
      console.error(err);
      alert("Error actualizando destacado: " + (err.message || JSON.stringify(err)));
    }
  };

  // Función para filtrar y ordenar participantes
  const getParticipantesFiltradosYOrdenados = () => {
    let participantesFiltrados = participantesDetallados.filter(p => {
      const cumpleNombre = p.nombre_participante.toLowerCase().includes(filtroNombre.toLowerCase());
      const cumpleSexo = filtroSexo === "" || p.sexo === filtroSexo;
      const cumpleRol = filtroRol === "" || p.rol === filtroRol;
      return cumpleNombre && cumpleSexo && cumpleRol;
    });

    // Ordenar
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

  // VISTA DE LISTA
  if (vista === "lista") {
    return (
      <div style={{ padding: 12 }}>
        <h3>Agregar Casa de Adolescentes</h3>
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div style={{ marginBottom: 12 }}>
            <label>Fecha inicio:</label>
            <input type="datetime-local" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Fecha término:</label>
            <input type="datetime-local" name="fecha_termino" value={formData.fecha_termino} onChange={handleChange} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Siembra:</label>
            <input type="number" name="siembra" value={formData.siembra || ""} onChange={handleChange} />
          </div>
          <button type="submit" style={botonStyle}>Guardar CDA</button>
        </form>

        <h3>Listado de Casas de Adolescentes</h3>
        {cdaList.map(cda => (
          <div key={cda.id_cda} style={{ 
            border: "1px solid #ccc", 
            padding: 12, 
            marginBottom: 8, 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
          }}>
            <span>CDA - {formatearFecha(cda.fecha_inicio)}</span>
            <button 
              onClick={() => verDetalles(cda)} 
              style={{
                ...botonStyle,
                backgroundColor: "#28a745"
              }}
            >
              Ver detalles
            </button>
          </div>
        ))}
      </div>
    );
  }

  // VISTA DE DETALLE
  if (vista === "detalle" && cdaSeleccionada) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Detalles de CDA - {formatearFecha(cdaSeleccionada.fecha_inicio)}</h3>
          <button 
            onClick={volverALista} 
            style={{
              ...botonStyle,
              backgroundColor: "#6c757d"
            }}
          >
            Volver a la lista
          </button>
        </div>

        <div style={{ border: "1px solid #ccc", padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <div><strong>Fecha inicio:</strong> {cdaSeleccionada.fecha_inicio}</div>
          <div><strong>Fecha término:</strong> {cdaSeleccionada.fecha_termino || "No definida"}</div>
          <div><strong>Siembra:</strong> {cdaSeleccionada.siembra ?? "N/A"}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <button 
            onClick={() => handleToggleParticipantes(cdaSeleccionada.id_cda)} 
            style={{ ...botonStyle, backgroundColor: "#0070f3" }}
          >
            {openCda === cdaSeleccionada.id_cda ? "Cerrar lista de participantes" : "Gestionar asistencias"}
          </button>
        </div>

        {openCda === cdaSeleccionada.id_cda && (
          <div style={{ border: "1px solid #ddd", padding: 16, marginBottom: 16, borderRadius: 8 }}>
            <h4>Marcar asistencias</h4>
            {participantes.map(p => (
              <div key={p.id_participante} style={{ marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={participantesSeleccionados[p.id_participante] || false}
                    onChange={() => handleParticipanteCheck(p.id_participante)}
                  />
                  <span style={{ marginLeft: 8 }}>{p.nombre_participante} ({p.edad} años)</span>
                </label>
              </div>
            ))}
            <button
              onClick={() => handleAgregarParticipantes(cdaSeleccionada.id_cda)}
              style={{ 
                marginTop: 12, 
                padding: "8px 16px", 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Guardar asistencias
            </button>
          </div>
        )}

        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8 }}>
          <h4>Participantes que asistieron:</h4>
          
          {participantesDetallados.length > 0 ? (
            <div>
              {/* Controles de filtros y ordenamiento */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr 1fr 1fr", 
                gap: "12px", 
                marginBottom: "16px",
                padding: "12px",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px"
              }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Buscar nombre:
                  </label>
                  <input
                    type="text"
                    value={filtroNombre}
                    onChange={(e) => setFiltroNombre(e.target.value)}
                    placeholder="Escribir nombre..."
                    style={{ 
                      width: "100%", 
                      padding: "6px", 
                      borderRadius: "4px", 
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Filtrar por sexo:
                  </label>
                  <select
                    value={filtroSexo}
                    onChange={(e) => setFiltroSexo(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "6px", 
                      borderRadius: "4px", 
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Filtrar por rol:
                  </label>
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    style={{ 
                      width: "100%", 
                      padding: "6px", 
                      borderRadius: "4px", 
                      border: "1px solid #ccc",
                      fontSize: "14px"
                    }}
                  >
                    <option value="">Todos</option>
                    <option value="Tropa">Tropa</option>
                    <option value="Capitan">Capitan</option>
                    <option value="Valiente de David">Valiente de David</option>
                    <option value="Intendente">Intendente</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                    Ordenar por:
                  </label>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <select
                      value={ordenarPor}
                      onChange={(e) => setOrdenarPor(e.target.value)}
                      style={{ 
                        flex: 1, 
                        padding: "6px", 
                        borderRadius: "4px", 
                        border: "1px solid #ccc",
                        fontSize: "14px"
                      }}
                    >
                      <option value="nombre">Nombre</option>
                      <option value="edad">Edad</option>
                      <option value="sexo">Sexo</option>
                      <option value="rol">Rol</option>
                    </select>
                    <button
                      onClick={() => setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc")}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "#fff",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                      title={`Ordenar ${ordenDireccion === "asc" ? "descendente" : "ascendente"}`}
                    >
                      {ordenDireccion === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabla de participantes */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ 
                  width: "100%", 
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th style={tableHeaderStyle}>⭐</th>
                      <th style={tableHeaderStyle}>Nombre</th>
                      <th style={tableHeaderStyle}>Edad</th>
                      <th style={tableHeaderStyle}>Sexo</th>
                      <th style={tableHeaderStyle}>Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getParticipantesFiltradosYOrdenados().map((p, index) => (
                      <tr key={p.id_participante} style={{ 
                        backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        borderBottom: "1px solid #dee2e6"
                      }}>
                        <td style={tableCellStyle}>
                          <button
                            onClick={() => toggleDestacado(p.id_participante, p.destacado)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: "4px"
                            }}
                            title={p.destacado ? "Quitar destacado" : "Marcar como destacado"}
                          >
                            {p.destacado ? "⭐" : "☆"}
                          </button>
                        </td>
                        <td style={tableCellStyle}>{p.nombre_participante}</td>
                        <td style={tableCellStyle}>{p.edad}</td>
                        <td style={tableCellStyle}>{p.sexo === "M" ? "Masculino" : "Femenino"}</td>
                        <td style={tableCellStyle}>{p.rol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
                Mostrando {getParticipantesFiltradosYOrdenados().length} de {participantesDetallados.length} participantes
              </div>
            </div>
          ) : (
            <p style={{ color: "#666" }}>Ningún participante registrado aún</p>
          )}
        </div>
      </div>
    );
  }
}

// Estilos para la tabla
const tableHeaderStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: "bold",
  borderBottom: "2px solid #dee2e6",
  fontSize: "14px"
};

const tableCellStyle = {
  padding: "10px 8px",
  borderBottom: "1px solid #dee2e6",
  fontSize: "14px"
};

// Botón estilo simple
const botonStyle = {
  marginTop: 4,
  marginLeft: 0,
  padding: "6px 12px",
  backgroundColor: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14
};