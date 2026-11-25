import { Link } from "wouter";

import "./TarjetaPropiedad.css";

import {
  ubiIcon,
  camaIcon,
  duchaIcon,
  medidaIcon,
  ojoVistoIcon,
} from "../../assets/icons";

const IMAGEN_POR_DEFECTO = "/images%20(1).jpg";

function usarImagenPorDefecto(event) {
  if (event.currentTarget.dataset.porDefecto) return;
  event.currentTarget.dataset.porDefecto = "true";
  event.currentTarget.src = IMAGEN_POR_DEFECTO;
}

export default function TarjetaPropiedad({ propiedad, className = "" }) {
  const { titulo, direccion, imagen, dormitorios, banos, superficie, operacion, estadoComercial } = propiedad;

  const caracteristicas = [
    { icono: camaIcon, valor: dormitorios, nombre: "Dormitorios" },
    { icono: duchaIcon, valor: banos, nombre: "Baños" },
    { icono: medidaIcon, valor: superficie === "-" ? "-" : `${superficie} m²`, nombre: "Superficie" },
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
            <img src={ubiIcon} alt="" />
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
            {estadoComercial || `Disponible ${operacion}`}
          </span>
        </div>

        <Link href={`/propiedad-publica?id=${propiedad.id}`} className="TarjetaPropiedad__detalle">
          <span className="TarjetaPropiedad__detalle-icono">
            <img src={ojoVistoIcon} alt="" />
          </span>
          Ver detalle
        </Link>
      </div>
    </article>
  );
}
