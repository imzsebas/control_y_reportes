import Link from "next/link"
import Card from "../components/Card"
import "./globals.css"

export default function Home() {
  const utilidades = [
    { id: "cda", nombre: "Casa de Adolescentes", descripcion: "Añadir descripcion" },
    { id: "gf", nombre: "Grupos familiares", descripcion: "Añadir descripcion" },
  ]

  return (
    <main className="home">
      <h1 className="titulo">Mis Utilidades 🤖</h1>
      <div className="grid">
        {utilidades.map((utilidad) => (
          <Link key={utilidad.id} href={`/utilidades/${utilidad.id}`}>
            <Card title={utilidad.nombre} description={utilidad.descripcion} />
          </Link>
        ))}
      </div>
    </main>
  )
}
