import "./Estadisticas.css";

const estadisticas = [
  { valor: "+15", texto: "Años de trayectoria", tono: "azul" },
  { valor: "1,200+", texto: "Propiedades vendidas", tono: "azul" },
  { valor: "98%", texto: "Clientes satisfechos", tono: "verde" },
  { valor: "450+", texto: "Propiedades activas", tono: "verde" },
];

export default function Estadisticas({ className = "" }) {
  return (
    <section className={`Estadisticas ${className}`} aria-label="Nuestros números">
      <ul className="Estadisticas__lista">
        {estadisticas.map(({ valor, texto, tono }) => (
          <li key={texto} className="Estadisticas__item">
            <strong className={`Estadisticas__valor Estadisticas__valor--${tono}`}>{valor}</strong>
            <span className="Estadisticas__texto">{texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
