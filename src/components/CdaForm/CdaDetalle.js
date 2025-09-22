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
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}-${mes}-${año}`;
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

  // ------- Funciones originales -------
  const handleModificarSiembra = () => {
    setEditandoSiembra(true);
    setNuevaSiembra(cdaSeleccionada.siembra || "");
  };

  const handleGuardarSiembra = async () => {
    try {
      const { error } = await supabase
        .from('cda')
        .update({ siembra: parseInt(nuevaSiembra, 10) || null })
        .eq('id_cda', cdaSeleccionada.id_cda);

      if (error) {
        throw error;
      }

      alert(`Siembra actualizada a: ${nuevaSiembra}`);
      
      await fetchAllCdaData();
      setEditandoSiembra(false);
    } catch (error) {
      console.error("Error completo al actualizar siembra:", error);
      alert("Error al actualizar la siembra: " + error.message);
    }
  };

  const handleCancelarSiembra = () => {
    setEditandoSiembra(false);
    setNuevaSiembra("");
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
        const { data, error } = await supabase
            .from('cda_participantes')
            .select('id_participante')
            .eq('id_cda', id_cda);
        
        if (error) {
            throw error;
        }

        const seleccionados = data.reduce((acc, current) => {
            acc[current.id_participante] = true;
            return acc;
        }, {});
        setParticipantesSeleccionados(seleccionados);
    } catch (err) {
        console.error("Error al cargar participantes seleccionados:", err);
    }
  };

  const handleParticipanteCheck = (id) => {
    setParticipantesSeleccionados(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAgregarParticipantes = async (id_cda) => {
    try {
        const participantesToAdd = participantes
            .filter(p => participantesSeleccionados[p.id_participante])
            .map(p => ({
                id_cda: id_cda,
                id_participante: p.id_participante,
                asistio: true
            }));
        
        const { error: deleteError } = await supabase
            .from('cda_participantes')
            .delete()
            .eq('id_cda', id_cda);

        if (deleteError) {
            throw deleteError;
        }

        if (participantesToAdd.length > 0) {
            const { error: insertError } = await supabase
                .from('cda_participantes') 
                .insert(participantesToAdd);
            
            if (insertError) {
                throw insertError;
            }
        }

        alert("Asistencia guardada correctamente");
        await fetchCdaParticipantes(id_cda); 
        await fetchAllCdaData();
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
      fetchCdaParticipantes(cdaSeleccionada.id_cda);
    } catch (err) {
      console.error("Error al actualizar destacado:", err);
      alert("Hubo un error al actualizar el estado de destacado: " + err.message);
    }
  };

  // ------- Render -------
  return (
    <div style={{ 
      padding: "16px", 
      maxWidth: "1200px", 
      margin: "0 auto", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e1e5e9"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <h2 style={{
            color: "#333",
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "20px",
            borderBottom: "2px solid #0066cc",
            paddingBottom: "10px"
          }}>
            CDA - {formatearFecha(cdaSeleccionada.fecha_inicio)}
          </h2>
          <button onClick={volverALista} style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"
          }}>
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
          style={{
            backgroundColor: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"
          }}
        >
          {openCda === cdaSeleccionada.id_cda ? "Cerrar gestión" : "Gestionar asistencias"}
        </button>
      </div>

      {openCda === cdaSeleccionada.id_cda && (
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "1px solid #e1e5e9"
        }}>
          <h4 style={{
            color: "#555",
            fontSize: "18px",
            fontWeight: "500",
            marginBottom: "16px"
          }}>Marcar asistencias</h4>
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
            style={{
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Actualizar asistencias
          </button>
        </div>
      )}

      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e1e5e9"
      }}>
        <h4 style={{
          color: "#555",
          fontSize: "18px",
          fontWeight: "500",
          marginBottom: "16px"
        }}>Participantes que asistieron</h4>
        
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
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#333",
                  fontSize: "14px"
                }}>Buscar nombre:</label>
                <input
                  type="text"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  placeholder="Escribir nombre..."
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#333",
                  fontSize: "14px"
                }}>Filtrar por sexo:</label>
                <select
                  value={filtroSexo}
                  onChange={(e) => setFiltroSexo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="">Todos</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#333",
                  fontSize: "14px"
                }}>Filtrar por rol:</label>
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                >
                  <option value="">Todos</option>
                  <option value="Tropa">Tropa</option>
                  <option value="Capitan">Capitán</option>
                  <option value="Valiente de David">Valiente de David</option>
                  <option value="Intendente">Intendente</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "#333",
                  fontSize: "14px"
                }}>Ordenar por:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={ordenarPor}
                    onChange={(e) => setOrdenarPor(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      fontSize: "14px",
                      boxSizing: "border-box"
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

            <div style={{
              overflowX: "auto",
              marginTop: "16px",
              borderRadius: "8px",
              border: "1px solid #e1e5e9"
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "white",
                minWidth: "600px"
              }}>
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
                      }}>{p.sexo}</td>
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