import './PanelImagen.css';

import Marca from '../marca/Marca';

export default function PanelImagen({ conMarca = false, className = "" }) {
    return (
        <section className={`PanelImagen ${className}`}>
            {conMarca && <Marca />}

            <div className='PanelImagen__contenido'>
                <h2 className='PanelImagen__titulo'>
                    Tu hogar y tu gestión,
                    <span>en un solo lugar.</span>
                </h2>

                <span className='PanelImagen__linea'></span>

                <p className='PanelImagen__texto'>
                    Todo lo que necesitas para administrar, alquilar y gestionar tus propiedades
                </p>
            </div>
        </section>
    )
}
