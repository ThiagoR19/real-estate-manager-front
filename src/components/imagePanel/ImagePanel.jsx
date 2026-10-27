import './ImagePanel.css';

import { Brand } from '../index';

export default function ImagePanel({ conBrand = false, className = "" }) {
    return (
        <section className={`ImagePanel ${className}`} data-sk-fondo>
            {conBrand && <Brand />}

            <div className='ImagePanel__contenido'>
                <h2 className='ImagePanel__titulo'>
                    Tu hogar y tu gestión,
                    <span>en un solo lugar.</span>
                </h2>

                <span className='ImagePanel__linea'></span>

                <p className='ImagePanel__texto'>
                    Todo lo que necesitas para administrar, alquilar y gestionar tus propiedades
                </p>
            </div>
        </section>
    )
}
