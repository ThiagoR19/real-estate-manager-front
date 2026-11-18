import "./PublicSkeletons.css";

export function PublicSkeletonBar({ width = "100%", height = 14, className = "" }) {
  return <span className={`public-loading__bar ${className}`} style={{ width, height }} aria-hidden="true" />;
}

export function PublicPropertiesSkeleton() {
  return (
    <div className="propiedades-publicas__grid" role="status" aria-label="Cargando propiedades" aria-busy="true">
      {Array.from({ length: 6 }, (_, index) => (
        <article className="propiedades-publicas__card public-loading__property-card" key={index} aria-hidden="true">
          <PublicSkeletonBar className="public-loading__card-image" />
          <div className="propiedades-publicas__card-body public-loading__card-body">
            <PublicSkeletonBar width="75%" height={23} />
            <PublicSkeletonBar width="60%" />
            <div className="public-loading__card-meta">
              <PublicSkeletonBar width={38} height={25} />
              <PublicSkeletonBar width={38} height={25} />
              <PublicSkeletonBar width={65} height={25} />
              <PublicSkeletonBar width={60} height={27} />
            </div>
            <PublicSkeletonBar height={48} />
          </div>
        </article>
      ))}
    </div>
  );
}

export function PublicPropertySkeleton() {
  return (
    <div className="public-loading__detail" role="status" aria-label="Cargando propiedad" aria-busy="true">
      <PublicSkeletonBar width="42%" height={38} className="public-loading__detail-title" />
      <div className="propiedad-publica__layout">
        <div className="propiedad-publica__gallery-column">
          <section className="propiedad-publica__gallery" aria-hidden="true">
            <div className="propiedad-publica__gallery-main">
              <PublicSkeletonBar height="100%" />
            </div>
            <div className="propiedad-publica__thumbnails">
              {Array.from({ length: 3 }, (_, index) => (
                <PublicSkeletonBar key={index} height="100%" className="public-loading__thumbnail" />
              ))}
            </div>
          </section>
          <section className="propiedad-publica__stats" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="propiedad-publica__stat-card public-loading__stat" key={index}>
                <PublicSkeletonBar width={35} height={35} />
                <PublicSkeletonBar width="48%" />
                <PublicSkeletonBar width={35} height={35} />
              </div>
            ))}
          </section>
        </div>
        <section className="propiedad-publica__info-card public-loading__info" aria-hidden="true">
          <div className="propiedad-publica__info-heading public-loading__price">
            <PublicSkeletonBar width="45%" height={49} />
            <PublicSkeletonBar width={212} height={44} />
          </div>
          <PublicSkeletonBar width={140} height={25} />
          <div className="public-loading__description">
            <PublicSkeletonBar />
            <PublicSkeletonBar width="90%" />
            <PublicSkeletonBar width="65%" />
          </div>
          {Array.from({ length: 3 }, (_, index) => (
            <div className="propiedad-publica__detail-row public-loading__detail-row" key={index}>
              <PublicSkeletonBar width={21} height={21} />
              <PublicSkeletonBar width="80%" />
              <PublicSkeletonBar width="70%" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
