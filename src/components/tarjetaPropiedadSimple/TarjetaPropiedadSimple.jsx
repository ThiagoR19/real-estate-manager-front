import { Link } from "wouter";
import { bathIcon, bedIcon, eyeIcon, rulerCombinedIcon, locationDotIcon } from "../../assets/icons";
import { AccionesPropiedad } from "../index";
import propertyImage from "/images (1).jpg";
import { api } from "../../services/api.js";

export default function TarjetaPropiedadSimple({
  property,
  onEdit,
  onDelete,
  onOpen,
  variant = "managed",
}) {
  const isPublic = variant === "public";
  const image = isPublic
    ? property.photos?.[0]?.src || property.image || propertyImage
    : api.urlRecurso(property.imagenes?.[0]?.url) || propertyImage;
  const title = isPublic ? property.title : property.nombre;
  const location = isPublic ? property.location : property.ubicacion;
  const status = isPublic
    ? property.status || (property.operation === "buy" ? "Disponible Venta" : "Disponible Alquiler")
    : property.estadoComercial;

  function openProperty() {
    onOpen?.(property);
  }

  function handleCardKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProperty();
    }
  }

  return (
    <article
      className={isPublic ? "propiedades-publicas__card" : "propiedades__card"}
      role={isPublic ? undefined : "link"}
      tabIndex={isPublic ? undefined : 0}
      onClick={isPublic ? undefined : openProperty}
      onKeyDown={isPublic ? undefined : handleCardKeyDown}
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
              (property.bedrooms ?? property.rooms)
            ) : (
              <span>{property.habitaciones}</span>
            )}
          </span>
          <span className={isPublic ? undefined : "propiedades__metric"}>
            <img
              className={isPublic ? undefined : "propiedades__icon"}
              src={bathIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? (property.bathrooms ?? property.baths) : <span>{property.banos}</span>}
          </span>
          <span className={isPublic ? undefined : "propiedades__metric"}>
            <img
              className={isPublic ? undefined : "propiedades__icon"}
              src={rulerCombinedIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? `${property.area} m²` : <span>{property.tamano} m²</span>}
          </span>
          {isPublic ? <em>{status}</em> : <span className="propiedades__status">{status}</span>}
        </div>

        {isPublic ? (
          <Link className="propiedades-publicas__details" href={`/propiedad-publica?id=${property.id}`}>
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
                openProperty();
              }}
            >
              <img className="propiedades__icon" src={eyeIcon} alt="" aria-hidden="true" />
              <span>Ver detalle</span>
            </button>
            <AccionesPropiedad
              name={title}
              onEdit={() => onEdit(property)}
              onDelete={() => onDelete(property)}
            />
          </div>
        )}
      </div>
    </article>
  );
}
