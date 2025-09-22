import Link from "next/link"
import Card from "../components/Card/Card"
import "./globals.css"

export default function Home() {
  const utilidades = [
    { id: "cda", nombre: "Casa de Adolescentes", descripcion: "" },
    { id: "gf", nombre: "Colportaje", descripcion: "" },
  ]

  return (
    <main className="home">
      <h1 className="titulo">Herramientas</h1>
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
