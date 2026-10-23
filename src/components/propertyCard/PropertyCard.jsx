import './PropertyCard.css';

import ubicacionIcono from '../../assets/icons/ubiIcon.svg';
import camaIcono from '../../assets/icons/camaIcon.svg';
import banoIcono from '../../assets/icons/duchaIcon.svg';
import superficieIcono from '../../assets/icons/medidaIcon.svg';
import ojoIcono from '../../assets/icons/ojoVistoIcon.svg';

export default function PropertyCard({ propiedad, className = "" }) {
    const { titulo, direccion, imagen, dormitorios, banos, superficie, operacion } = propiedad;

    const caracteristicas = [
        { icono: camaIcono, valor: dormitorios, nombre: "Dormitorios" },
        { icono: banoIcono, valor: banos, nombre: "Baños" },
        { icono: superficieIcono, valor: `${superficie} m²`, nombre: "Superficie" }
    ];

    return (
        <article className={`PropertyCard ${className}`}>
            <img className='PropertyCard__imagen' src={imagen} alt={titulo} />

            <div className='PropertyCard__cuerpo'>
                <h3 className='PropertyCard__titulo'>{titulo}</h3>

                <p className='PropertyCard__direccion'>
                    <span className='PropertyCard__icono'><img src={ubicacionIcono} alt="" /></span>
                    {direccion}
                </p>

                <div className='PropertyCard__datos'>
                    <ul className='PropertyCard__caracteristicas'>
                        {caracteristicas.map(({ icono, valor, nombre }) => (
                            <li key={nombre} className='PropertyCard__caracteristica' title={nombre}>
                                <span className='PropertyCard__icono'><img src={icono} alt={nombre} /></span>
                                {valor}
                            </li>
                        ))}
                    </ul>

                    <span className={`PropertyCard__operacion PropertyCard__operacion--${operacion.toLowerCase()}`}>
                        {operacion}
                    </span>
                </div>

                <a href="#" className='PropertyCard__detalle'>
                    <span className='PropertyCard__detalle-icono'><img src={ojoIcono} alt="" /></span>
                    Ver detalle
                </a>
            </div>
        </article>
    )
}
