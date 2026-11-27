import { assetUrl } from "../../utils/assetUrl.js";
import { Link } from "wouter";
import { bathIcon, bedIcon, eyeIcon, rulerCombinedIcon, locationDotIcon } from "../../assets/icons";
import { AccionesPropiedad } from "../index";
import propertyImage from "/images (1).jpg";

export default function TarjetaPropiedadSimple({
  propiedad,
  onEdit,
  onDelete,
  onOpen,
  variant = "managed",
}) {
  const isPublic = variant === "public";
  const image = isPublic ? propiedad.photos?.[0]?.src || propiedad.image || propertyImage : assetUrl(propiedad.imagenes?.[0]?.url) || propertyImage;
  const title = isPublic ? propiedad.title : propiedad.nombre;
  const location = isPublic ? propiedad.location : propiedad.ubicacion;
  const status = isPublic ? propiedad.status || (propiedad.operation === "buy" ? "Disponible Venta" : "Disponible Alquiler") : propiedad.estadoComercial;

  function abrirPropiedad() {
    onOpen?.(propiedad);
  }

  function manejarTecladoTarjeta(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      abrirPropiedad();
    }
  }

  return (
    <article
      className={isPublic ? "propiedades-publicas__card" : "propiedades__card"}
      role={isPublic ? undefined : "link"}
      tabIndex={isPublic ? undefined : 0}
      onClick={isPublic ? undefined : abrirPropiedad}
      onKeyDown={isPublic ? undefined : manejarTecladoTarjeta}
      aria-label={isPublic ? undefined : `Ver detalle de ${title}`}
    >
      <img
        className={isPublic ? undefined : "propiedades__card-image"}
        src={image}
        alt={isPublic ? title : "Interior de la propiedad"}
        onError={(event) => {
          if (event.currentTarget.dataset.porDefecto) return;
          event.currentTarget.dataset.porDefecto = "true";
          event.currentTarget.src = propertyImage;
        }}
      />
      <div className={isPublic ? "propiedades-publicas__card-body" : "propiedades__card-content"}>
        <h2 className={isPublic ? undefined : "propiedades__card-title"}>{title}</h2>
        <p className={isPublic ? "propiedades-publicas__location" : "propiedades__card-location"}>
          <img
            className={isPublic ? undefined : "propiedades__icon"}
            src={locationDotIcon}
            alt=""
            aria-hidden="true"
          />
          <span>{location}</span>
        </p>

        <div
          className={isPublic ? "propiedades-publicas__meta" : "propiedades__card-metrics"}
          aria-label="Características de la propiedad"
        >
          <span className={isPublic ? undefined : "propiedades__metric"}>
            <img
              className={isPublic ? undefined : "propiedades__icon"}
              src={bedIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? (
              (propiedad.bedrooms ?? propiedad.rooms)
            ) : (
              <span>{propiedad.habitaciones}</span>
            )}
          </span>
          <span className={isPublic ? undefined : "propiedades__metric"}>
            <img
              className={isPublic ? undefined : "propiedades__icon"}
              src={bathIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? (propiedad.bathrooms ?? propiedad.baths) : <span>{propiedad.banos}</span>}
          </span>
          <span className={isPublic ? undefined : "propiedades__metric"}>
            <img
              className={isPublic ? undefined : "propiedades__icon"}
              src={rulerCombinedIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? `${propiedad.area} m²` : <span>{propiedad.tamano} m²</span>}
          </span>
          {isPublic ? <em>{status}</em> : <span className="propiedades__status">{status}</span>}
        </div>

        {isPublic ? (
          <Link className="propiedades-publicas__details" href={`/propiedad-publica?id=${propiedad.id}`}>
            <img src={eyeIcon} alt="" aria-hidden="true" />
            Ver detalle
          </Link>
        ) : (
          <div className="propiedades__card-actions">
            <button
              className="propiedades__details-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                abrirPropiedad();
              }}
            >
              <img className="propiedades__icon" src={eyeIcon} alt="" aria-hidden="true" />
              <span>Ver detalle</span>
            </button>
            <AccionesPropiedad
              nombre={title}
              onEdit={() => onEdit(propiedad)}
              onDelete={() => onDelete(propiedad)}
            />
          </div>
        )}
      </div>
    </article>
  );
}
