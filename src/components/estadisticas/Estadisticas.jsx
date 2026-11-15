import "./Estadisticas.css";



export default function Estadisticas({ className = "", vendidas = 0, anios = 0, activas = 0 }) {
  
  const calcularClientesSatisfechos = (aniosExp, propVendidas) => {
    const baseSatisfaccion = 88; 
    const bonoExperiencia = Math.min((Number(aniosExp) || 0) * 1.2, 4);
    const bonoVentas = Math.min((Number(propVendidas) || 0) * 0.35, 6);
    let porcentajeFinal = baseSatisfaccion + bonoExperiencia + bonoVentas;
    
    return Math.round(Math.min(Math.max(porcentajeFinal, 85), 99));
  };

  const porcentajeSatisfechos = `${calcularClientesSatisfechos(anios, vendidas)}%`;

  const estadisticas = [
    { valor: `+${anios}`, texto: "Años de trayectoria", tono: "azul" },
    { valor: `+${vendidas}`, texto: "Propiedades vendidas", tono: "azul" },
    { valor: porcentajeSatisfechos, texto: "Clientes satisfechos", tono: "verde" },
    { valor: `+${activas}`, texto: "Propiedades activas", tono: "verde" },
  ];

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
