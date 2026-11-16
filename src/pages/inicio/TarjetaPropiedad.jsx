import { Link } from "wouter";

import "./TarjetaPropiedad.css";

import ubicacionIcono from "../../assets/icons/ubiIcon.svg";
import camaIcono from "../../assets/icons/camaIcon.svg";
import banoIcono from "../../assets/icons/duchaIcon.svg";
import superficieIcono from "../../assets/icons/medidaIcon.svg";
import ojoIcono from "../../assets/icons/ojoVistoIcon.svg";

// Imagen que se muestra si la propiedad no tiene foto o la foto no carga
const IMAGEN_POR_DEFECTO = "/images%20(1).jpg";

// Cambia una foto que no cargó por la imagen por defecto (una sola vez)
function usarImagenPorDefecto(event) {
  if (event.currentTarget.dataset.porDefecto) return;
  event.currentTarget.dataset.porDefecto = "true";
  event.currentTarget.src = IMAGEN_POR_DEFECTO;
}

export default function TarjetaPropiedad({ propiedad, className = "" }) {
  const { titulo, direccion, imagen, dormitorios, banos, superficie, operacion } = propiedad;

  const caracteristicas = [
    { icono: camaIcono, valor: dormitorios, nombre: "Dormitorios" },
    { icono: banoIcono, valor: banos, nombre: "Baños" },
    { icono: superficieIcono, valor: superficie === "-" ? "-" : `${superficie} m²`, nombre: "Superficie" },
  ];

  return (
    <article className={`TarjetaPropiedad ${className}`}>
      <img
        className="TarjetaPropiedad__imagen"
        src={imagen || IMAGEN_POR_DEFECTO}
        alt={titulo}
        onError={usarImagenPorDefecto}
      />

      <div className="TarjetaPropiedad__cuerpo">
        <h3 className="TarjetaPropiedad__titulo">{titulo}</h3>

        <p className="TarjetaPropiedad__direccion">
          <span className="TarjetaPropiedad__icono">
            <img src={ubicacionIcono} alt="" />
          </span>
          {direccion}
        </p>

        <div className="TarjetaPropiedad__datos">
          <ul className="TarjetaPropiedad__caracteristicas">
            {caracteristicas.map(({ icono, valor, nombre }) => (
              <li key={nombre} className="TarjetaPropiedad__caracteristica" title={nombre}>
                <span className="TarjetaPropiedad__icono">
                  <img src={icono} alt={nombre} />
                </span>
                {valor}
              </li>
            ))}
          </ul>

          <span
            className={`TarjetaPropiedad__operacion TarjetaPropiedad__operacion--${operacion.toLowerCase()}`}
          >
            {operacion}
          </span>
        </div>

        <Link href={`/propiedad-publica?id=${propiedad.id}`} className="TarjetaPropiedad__detalle">
          <span className="TarjetaPropiedad__detalle-icono">
            <img src={ojoIcono} alt="" />
          </span>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
