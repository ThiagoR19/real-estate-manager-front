import { useEffect, useState } from "react";
import { Link, useSearchParams } from "wouter";
import { bathIcon, bedIcon, cameraIcon, calendarIcon, boltIcon, carIcon, checkIcon, clockIcon, dropletIcon, fireFlameSimpleIcon, houseIcon, locationDotIcon, rulerCombinedIcon, userIcon, whatsappIcon, angleDownIcon } from "../../assets/icons";
import { api } from "../../services/api";
import { Skeleton, mostrarAviso } from "../../components";
import { PublicPropertySkeleton } from "../../components/skeleton/PublicSkeletons";
import propertyImage from "../../assets/fondoCasa.png";
import "./PropiedadPublica.css";

function IconoPropiedad({ src, className = "" }) {
  return (
    <img className={`propiedad-publica__icon ${className}`} src={src} alt="" aria-hidden="true" />
  );
}

function usarImagenPorDefecto(event) {
  if (event.currentTarget.dataset.porDefecto) return;
  event.currentTarget.dataset.porDefecto = "true";
  event.currentTarget.src = propertyImage;
}

function formatearPrecio(precio, moneda) {
  if (precio === null) return "Precio a consultar";
  return `${moneda} ${new Intl.NumberFormat("es-AR").format(precio)}`;
}

function enlaceWhatsapp(telefono, nombrePropiedad) {
  const numero = telefono.replace(/\D/g, "");
  const texto = encodeURIComponent(`Hola, me interesa la propiedad "${nombrePropiedad}".`);
  return `https://wa.me/${numero}?text=${texto}`;
}

function DetallePropiedad({ propiedad }) {
  const [activeImage, setActiveImage] = useState(0);
  const fotos = propiedad.imagenes.length ? propiedad.imagenes : [propertyImage];
  const variasFotos = fotos.length > 1;

  const stats = [
    { label: "Habitaciones", value: propiedad.habitaciones, icon: bedIcon },
    { label: "Antigüedad (años)", value: propiedad.antiguedad, icon: calendarIcon },
    { label: "Baños", value: propiedad.banios, icon: bathIcon },
    { label: "Superficie (m²)", value: propiedad.tamanio, icon: rulerCombinedIcon },
  ];

  const details = [
    { label: "Tipo", value: propiedad.tipo, icon: houseIcon },
    { label: "Disponibilidad", value: propiedad.estadoComercial || `Disponible ${propiedad.operacion}`, icon: clockIcon },
    { label: "Ubicación", value: propiedad.ubicacion || "A consultar", icon: locationDotIcon },
    { label: "Agente asignado", value: propiedad.agente || "A confirmar", icon: userIcon },
  ];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = propiedad.nombre;
    return () => {
      document.title = previousTitle;
    };
  }, [propiedad.nombre]);

  function cambiarImagen(direction) {
    setActiveImage((current) => (current + direction + fotos.length) % fotos.length);
  }

  function contactarAgente() {
    if (propiedad.telefonoAgente) {
      window.open(enlaceWhatsapp(propiedad.telefonoAgente, propiedad.nombre), "_blank", "noopener");
      return;
    }
    mostrarAviso({ tipo: "info", titulo: "Contacto no disponible", mensaje: "Esta propiedad no tiene un teléfono de contacto publicado." });
  }

  return (
    <>
      <h1>{propiedad.nombre}</h1>

      <div className="propiedad-publica__layout">
        <div className="propiedad-publica__gallery-column">
          <section className="propiedad-publica__gallery" aria-label="Galería de fotos de la propiedad">
            <div className="propiedad-publica__gallery-main">
              <img
                src={fotos[activeImage]}
                alt={`Foto ${activeImage + 1} de ${propiedad.nombre}`}
                onError={usarImagenPorDefecto}
              />
              {variasFotos && (
                <>
                  <button
                    className="propiedad-publica__gallery-arrow propiedad-publica__gallery-arrow--previous"
                    type="button"
                    aria-label="Imagen anterior"
                    onClick={() => cambiarImagen(-1)}
                  >
                    <img className="izquierda" src={angleDownIcon} alt="" />
                  </button>
                  <button
                    className="propiedad-publica__gallery-arrow propiedad-publica__gallery-arrow--next"
                    type="button"
                    aria-label="Imagen siguiente"
                    onClick={() => cambiarImagen(1)}
                  >
                    <img className="derecha" src={angleDownIcon} alt="" />
                  </button>
                </>
              )}
              <span className="propiedad-publica__gallery-counter">
                <IconoPropiedad src={cameraIcon} />
                {activeImage + 1}/{fotos.length}
              </span>
            </div>
            {variasFotos && (
              <div className="propiedad-publica__thumbnails" role="list" aria-label="Seleccionar foto">
                {fotos.map((foto, index) => (
                  <button
                    className={`propiedad-publica__thumbnail${activeImage === index ? " is-active" : ""}`}
                    type="button"
                    role="listitem"
                    aria-label={`Ver foto ${index + 1}`}
                    aria-current={activeImage === index ? "true" : undefined}
                    key={`${foto}-${index}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={foto} alt="" onError={usarImagenPorDefecto} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="propiedad-publica__stats" aria-label="Características principales">
            {stats.map((stat) => (
              <article className="propiedad-publica__stat-card" key={stat.label}>
                <span className="propiedad-publica__stat-icon-wrap">
                  <IconoPropiedad src={stat.icon} />
                </span>
                <strong>{stat.label}</strong>
                <span className="propiedad-publica__stat-value">{stat.value ?? "-"}</span>
              </article>
            ))}
          </section>
        </div>

        <section className="propiedad-publica__info-card" aria-labelledby="propiedad-publica-description">
          <div className="propiedad-publica__info-heading">
            <strong>{formatearPrecio(propiedad.precio, propiedad.moneda)}</strong>
            <small>
              {propiedad.tipo} · {propiedad.operacion}
            </small>
            <button type="button" onClick={contactarAgente}>
              {propiedad.operacion}
            </button>
          </div>
          <h2 id="propiedad-publica-description">Descripción</h2>
          <p className="propiedad-publica__description">
            {propiedad.descripcion || "Esta propiedad todavía no tiene descripción."}
          </p>
          <div className="propiedad-publica__details">
            {details.map((detail) => (
              <div className="propiedad-publica__detail-row" key={detail.label}>
                <IconoPropiedad src={detail.icon} />
                <strong>{detail.label}</strong>
                <span>{detail.value}</span>
              </div>
            ))}
          </div>
          <section className="propiedad-publica__services" aria-labelledby="propiedad-publica-services">
            <h2 id="propiedad-publica-services">Servicios</h2>
            {propiedad.servicios?.length ? (
              <ul className="propiedad-publica__services-list">
                {propiedad.servicios.map((servicio) => (
                  <li key={servicio.id}>
                    <IconoPropiedad src={{
                      Agua: dropletIcon,
                      Gas: fireFlameSimpleIcon,
                      Luz: boltIcon,
                      Estacionamiento: carIcon,
                    }[servicio.nombre] || checkIcon} />
                    <span>{servicio.nombre}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="propiedad-publica__description">Sin especificar.</p>
            )}
          </section>
        </section>
      </div>

      <button className="propiedad-publica__contact" type="button" onClick={contactarAgente}>
        <img src={whatsappIcon} alt="" />
        Contactar
      </button>
    </>
  );
}

function SinPropiedad({ mensaje }) {
  return (
    <div className="propiedad-publica__estado">
      <p>{mensaje}</p>
      <Link href="/propiedades-publicas">Ver todas las propiedades</Link>
    </div>
  );
}

export default function PropiedadPublica() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [estado, setEstado] = useState({ id: null, propiedad: null });
  const cargando = estado.id !== id;

  useEffect(() => {
    if (!id) return undefined;
    let activo = true;
    api.propiedadPublica(id)
      .then((propiedad) => activo && setEstado({ id, propiedad }))
      .catch((error) => {
        console.error(error);
        if (activo) {
          setEstado({ id, propiedad: null });
          mostrarAviso({ tipo: "error", titulo: "No se pudo cargar la propiedad", mensaje: error.message });
        }
      });
    return () => {
      activo = false;
    };
  }, [id]);

  function contenido() {
    if (!id) return <SinPropiedad mensaje="No se indicó qué propiedad mostrar." />;
    if (cargando) return <PublicPropertySkeleton />;
    if (!estado.propiedad) return <SinPropiedad mensaje="La propiedad no existe o ya no está publicada." />;
    return <Skeleton key={estado.propiedad.id}><DetallePropiedad propiedad={estado.propiedad} /></Skeleton>;
  }

  return (
    <main className="propiedad-publica">
      <div className="propiedad-publica__page">{contenido()}</div>
    </main>
  );
}
