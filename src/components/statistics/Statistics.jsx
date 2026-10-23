import './Statistics.css';

const estadisticas = [
    { valor: "+15", texto: "Años de trayectoria", tono: "azul" },
    { valor: "1,200+", texto: "Propiedades vendidas", tono: "azul" },
    { valor: "98%", texto: "Clientes satisfechos", tono: "verde" },
    { valor: "450+", texto: "Propiedades activas", tono: "verde" }
];

export default function Statistics({ className = "" }) {
    return (
        <section className={`Statistics ${className}`} aria-label="Nuestros números">
            <ul className='Statistics__lista'>
                {estadisticas.map(({ valor, texto, tono }) => (
                    <li key={texto} className='Statistics__item'>
                        <strong className={`Statistics__valor Statistics__valor--${tono}`}>{valor}</strong>
                        <span className='Statistics__texto'>{texto}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}
