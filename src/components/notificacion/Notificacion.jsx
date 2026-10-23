import './Notificacion.css';


const nombresTipo = {
    vencimiento: "Vencimiento",
    visita: "Visita",
    reporte: "Reporte"
};


export default function Notificacion({ notificacion, expandida, destacada = false, onAlternar }) {
    const { id, tipo, hace, titulo, resumen, detalle = [], leida } = notificacion;
    const idDetalle = `notificacion-detalle-${id}`;

    return (
        <article
            className={`Notificacion ${leida ? "Notificacion--leida" : ""} ${expandida ? "Notificacion--expandida" : ""} ${destacada ? "Notificacion--destacada" : ""}`}
        >
            <p className='Notificacion__meta'>
                <span className={`Notificacion__punto Notificacion__punto--${tipo}`}></span>
                <span className='Notificacion__tipo'>{nombresTipo[tipo]}</span>
                <span className='Notificacion__tiempo'>{hace}</span>
            </p>

            <h3 className='Notificacion__titulo'>{titulo}</h3>

            <p className='Notificacion__resumen'>{resumen}</p>

            {/* grid 0fr → 1fr: anima la altura sin saber cuánto mide */}
            <div className='Notificacion__detalle' id={idDetalle}>
                <div className='Notificacion__detalle-interno'>
                    {detalle.map((linea) => (
                        <p key={linea} className='Notificacion__linea'>{linea}</p>
                    ))}
                </div>
            </div>

            <button
                type="button"
                className='Notificacion__boton'
                aria-expanded={expandida}
                aria-controls={idDetalle}
                onClick={onAlternar}
            >
                {expandida ? "Contraer" : "Expandir"}
            </button>
        </article>
    )
}
