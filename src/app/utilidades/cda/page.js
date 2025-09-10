"use client";
import { useRouter } from "next/navigation";

export default function CdaPage() {
  const router = useRouter();

  return (
    <div>
      <header className="navbar">
        <h2 className="logo">Casa de Adolescentes</h2>
        <nav>
          <button onClick={() => router.push("/utilidades/cda/agregar")}>
            Agregar Casa de Adolescentes
          </button>
          <button onClick={() => router.push("/utilidades/cda/ver")}>
            Ver Casas de Adolescentes
          </button>
          <button onClick={() => router.push("/utilidades/cda/participantes")}>
            Añadir Participante
          </button>
        </nav>
      </header>

      <main className="contenido">
        <p>Bienvenido a Casa de Adolescentes. Selecciona una opción en el menú.</p>
      </main>
    </div>
  );
}
