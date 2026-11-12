import { Link } from "wouter";
import { bathIcon, bedIcon, eyeIcon, rulerCombinedIcon, locationDotIcon } from "../../assets/icons";
import { PropertyActions } from "../index";
import propertyImage from "/images (1).jpg";
import { api } from "../../services/api.js";

export default function PropertyCardSimple({
  property,
  onEdit,
  onDelete,
  onOpen,
  variant = "managed",
}) {
  const isPublic = variant === "public";
  const image = isPublic
    ? property.photos?.[0]?.src || property.image || propertyImage
    : api.assetUrl(property.imagenes?.[0]?.url) || propertyImage;
  const title = isPublic ? property.title : property.nombre;
  const location = isPublic ? property.location : property.ubicacion;
  const status = isPublic
    ? property.operation === "buy"
      ? "Venta"
      : "Alquiler"
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
      className={isPublic ? "public-properties__card" : "properties__card"}
      role={isPublic ? undefined : "link"}
      tabIndex={isPublic ? undefined : 0}
      onClick={isPublic ? undefined : openProperty}
      onKeyDown={isPublic ? undefined : handleCardKeyDown}
      aria-label={isPublic ? undefined : `Ver detalle de ${title}`}
    >
      <img
        className={isPublic ? undefined : "properties__card-image"}
        src={image}
        alt={isPublic ? title : "Interior de la propiedad"}
      />
      <div className={isPublic ? "public-properties__card-body" : "properties__card-content"}>
        <h2 className={isPublic ? undefined : "properties__card-title"}>{title}</h2>
        <p className={isPublic ? "public-properties__location" : "properties__card-location"}>
          <img
            className={isPublic ? undefined : "properties__icon"}
            src={locationDotIcon}
            alt=""
            aria-hidden="true"
          />
          <span>{location}</span>
        </p>

        <div
          className={isPublic ? "public-properties__meta" : "properties__card-metrics"}
          aria-label="Características de la propiedad"
        >
          <span className={isPublic ? undefined : "properties__metric"}>
            <img
              className={isPublic ? undefined : "properties__icon"}
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
          <span className={isPublic ? undefined : "properties__metric"}>
            <img
              className={isPublic ? undefined : "properties__icon"}
              src={bathIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? (property.bathrooms ?? property.baths) : <span>{property.banos}</span>}
          </span>
          <span className={isPublic ? undefined : "properties__metric"}>
            <img
              className={isPublic ? undefined : "properties__icon"}
              src={rulerCombinedIcon}
              alt=""
              aria-hidden="true"
            />
            {isPublic ? `${property.area} m²` : <span>{property.tamano} m²</span>}
          </span>
          {isPublic ? <em>{status}</em> : <span className="properties__status">{status}</span>}
        </div>

        {isPublic ? (
          <Link className="public-properties__details" href="/public-property">
            <img src={eyeIcon} alt="" aria-hidden="true" />
            Ver detalle
          </Link>
        ) : (
          <div className="properties__card-actions">
            <button
              className="properties__details-button"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openProperty();
              }}
            >
              <img className="properties__icon" src={eyeIcon} alt="" aria-hidden="true" />
              <span>Ver detalle</span>
            </button>
            <PropertyActions
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
