import "./Skeleton.css";

export default function Skeleton({ as: Etiqueta = "div", className = "", cargando = false, children, ...props }) {
  return (
    <Etiqueta className={`${className} ${cargando ? "Skeleton" : ""}`} aria-busy={cargando} {...props}>
      {children}
    </Etiqueta>
  );
}
