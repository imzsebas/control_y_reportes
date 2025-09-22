"use client";
import { useState, useEffect } from "react";

import ParticipantesForm from "./participantes/page";
import CdaForm from "../../../components/CdaForm/CdaForm";

export default function CdaPage() {
  const [vista, setVista] = useState("inicio");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    
    backgroundOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
      `,
      pointerEvents: 'none',
      zIndex: -1,
    },

    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease',
    },

    title: {
      fontWeight: '700',
      fontSize: '1.5rem',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      background: 'linear-gradient(135deg, #fff, #f0f8ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },

    hamburger: {
      fontSize: '24px',
      cursor: 'pointer',
      display: isMobile ? 'block' : 'none',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      padding: '0.5rem',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
    },

    nav: {
      display: isMobile ? (isMenuOpen ? 'flex' : 'none') : 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      position: isMobile ? 'absolute' : 'static',
      top: isMobile ? '100%' : 'auto',
      right: isMobile ? '0' : 'auto',
      background: isMobile ? 'rgba(33, 37, 41, 0.95)' : 'transparent',
      backdropFilter: isMobile ? 'blur(20px)' : 'none',
      padding: isMobile ? '1rem' : '0',
      borderRadius: isMobile ? '0 0 15px 15px' : '0',
      boxShadow: isMobile ? '0 8px 32px rgba(31, 38, 135, 0.37)' : 'none',
      gap: isMobile ? '12px' : '12px',
      width: isMobile ? '250px' : 'auto',
      zIndex: 10,
    },

    navButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      border: '2px solid transparent',
      borderRadius: '25px',
      padding: '0.7rem 1.2rem',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    },

    navButtonGreen: {
      background: 'rgba(40, 167, 69, 0.3)',
      backdropFilter: 'blur(10px)',
      color: 'white',
      border: '2px solid rgba(40, 167, 69, 0.3)',
      borderRadius: '25px',
      padding: '0.7rem 1.2rem',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    },

    main: {
      padding: '2rem',
      minHeight: 'calc(100vh - 80px)',
      position: 'relative',
      zIndex: 1,
    },

    welcomeContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: vista === 'inicio' ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '2rem',
    },

    welcomeModal: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(30px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '25px',
      padding: '3rem',
      textAlign: 'center',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 15px 35px rgba(31, 38, 135, 0.5)',
      position: 'relative',
      overflow: 'hidden',
      animation: 'fadeInScale 0.6s ease-out',
    },

    welcomeTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #fff, #f0f8ff)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    },

    welcomeText: {
      fontSize: '1.1rem',
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: '1.6',
      marginBottom: '0',
    },

    contentArea: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      marginTop: '2rem',
    }
  };

  // Efecto hover para botones
  const handleButtonHover = (e, isGreen = false) => {
    if (isGreen) {
      e.target.style.background = 'rgba(40, 167, 69, 0.6)';
      e.target.style.transform = 'translateY(-3px)';
      e.target.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.4)';
    } else {
      e.target.style.background = 'rgba(255, 255, 255, 0.2)';
      e.target.style.transform = 'translateY(-3px)';
      e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
    }
  };

  const handleButtonLeave = (e, isGreen = false) => {
    if (isGreen) {
      e.target.style.background = 'rgba(40, 167, 69, 0.3)';
    } else {
      e.target.style.background = 'rgba(255, 255, 255, 0.1)';
    }
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .welcome-modal::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: rotate(45deg) translateX(-100%);
          transition: transform 0.6s ease;
        }
        
        .welcome-modal:hover::before {
          transform: rotate(45deg) translateX(100%);
        }
      `}</style>
      
      <div style={styles.container}>
        <div style={styles.backgroundOverlay}></div>
        
        <header style={styles.header}>
          <h2 style={styles.title}>Casa de Adolescentes</h2>
          <button onClick={toggleMenu} style={styles.hamburger}>
            &#9776;
          </button>
          <nav style={styles.nav}>
            <button
              onClick={() => {
                setVista("participante");
                setIsMenuOpen(false);
              }}
              style={styles.navButton}
              onMouseEnter={(e) => handleButtonHover(e, false)}
              onMouseLeave={(e) => handleButtonLeave(e, false)}
            >
              Agregar Participante
            </button>
            <button
              onClick={() => {
                setVista("cda");
                setIsMenuOpen(false);
              }}
              style={styles.navButtonGreen}
              onMouseEnter={(e) => handleButtonHover(e, true)}
              onMouseLeave={(e) => handleButtonLeave(e, true)}
            >
              Agregar / Ver Casas de Adolescentes
            </button>
          </nav>
        </header>

        {/* Modal de bienvenida centrado */}
        <div style={styles.welcomeContainer}>
          <div style={styles.welcomeModal} className="welcome-modal">
            <h3 style={styles.welcomeTitle}>¡Bienvenido! 👋</h3>
            <p style={styles.welcomeText}>
              Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú superior para comenzar.
            </p>
          </div>
        </div>

        <main style={styles.main}>
          {vista === "participante" && (
            <div style={styles.contentArea}>
              <ParticipantesForm />
            </div>
          )}
          {vista === "cda" && (
            <div style={styles.contentArea}>
              <CdaForm />
            </div>
          )}
        </main>
      </div>
    </>
  );
}