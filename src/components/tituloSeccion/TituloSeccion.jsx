import "./TituloSeccion.css";

export default function TituloSeccion({ titulo, subtitulo, id, className = "" }) {
  return (
    <header className={`TituloSeccion ${className}`}>
      <h2 className="TituloSeccion__titulo" id={id}>{titulo}</h2>{subtitulo && <p className="TituloSeccion__subtitulo">{subtitulo}</p>}
    </header>
  );
}
