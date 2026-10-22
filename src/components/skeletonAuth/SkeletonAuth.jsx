import './SkeletonAuth.css';

function MarcaSkeleton() {
    return (
        <div className='SkeletonAuth__marca'>
            <span className='SkeletonAuth__bloque SkeletonAuth__marca-logo'></span>
            <span className='SkeletonAuth__bloque SkeletonAuth__marca-nombre'></span>
        </div>
    )
}

function CampoSkeleton({ className = "" }) {
    return (
        <div className={`SkeletonAuth__campo ${className}`}>
            <span className='SkeletonAuth__bloque SkeletonAuth__label'></span>
            <span className='SkeletonAuth__bloque SkeletonAuth__input'></span>
        </div>
    )
}

export default function SkeletonAuth({ variante = "login", sinHero = false, oculto = false, className = "" }) {
    const esRegistro = variante === "registro";

    return (
        <div
            className={`SkeletonAuth SkeletonAuth--${variante} ${sinHero ? "SkeletonAuth--sinHero" : ""} ${oculto ? "SkeletonAuth--oculto" : ""} ${className}`}
            aria-hidden="true"
        >
            {!sinHero && (
                <div className='SkeletonAuth__hero'>
                    {!esRegistro && <MarcaSkeleton />}

                    <div className='SkeletonAuth__hero-contenido'>
                        <span className='SkeletonAuth__bloque SkeletonAuth__hero-titulo'></span>
                        <span className='SkeletonAuth__bloque SkeletonAuth__hero-titulo SkeletonAuth__hero-titulo--corto'></span>
                        <span className='SkeletonAuth__hero-linea'></span>
                        <span className='SkeletonAuth__bloque SkeletonAuth__hero-texto'></span>
                        <span className='SkeletonAuth__bloque SkeletonAuth__hero-texto SkeletonAuth__hero-texto--corto'></span>
                    </div>
                </div>
            )}

            <div className='SkeletonAuth__panel'>
                {esRegistro && <MarcaSkeleton />}

                <div className='SkeletonAuth__formulario'>
                    <span className='SkeletonAuth__bloque SkeletonAuth__titulo'></span>
                    <span className='SkeletonAuth__bloque SkeletonAuth__subtitulo'></span>

                    <div className='SkeletonAuth__campos'>
                        <CampoSkeleton className='SkeletonAuth__campo--completo' />
                        <CampoSkeleton />
                        {esRegistro && <CampoSkeleton />}
                    </div>

                    {!esRegistro && <span className='SkeletonAuth__bloque SkeletonAuth__olvido'></span>}

                    <div className='SkeletonAuth__botones'>
                        <span className='SkeletonAuth__bloque SkeletonAuth__boton'></span>
                        <span className='SkeletonAuth__bloque SkeletonAuth__separador'></span>
                        <span className='SkeletonAuth__bloque SkeletonAuth__boton SkeletonAuth__boton--google'></span>
                    </div>
                </div>

                <div className='SkeletonAuth__pie'>
                    <span className='SkeletonAuth__bloque SkeletonAuth__legal'></span>
                    {esRegistro && <span className='SkeletonAuth__bloque SkeletonAuth__cuenta'></span>}
                </div>
            </div>
        </div>
    )
}
