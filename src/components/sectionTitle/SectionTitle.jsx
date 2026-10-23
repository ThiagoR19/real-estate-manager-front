import './SectionTitle.css';

export default function SectionTitle({ titulo, subtitulo, id, className = "" }) {
    return (
        <header className={`SectionTitle ${className}`}>
            <h2 className='SectionTitle__titulo' id={id}>{titulo}</h2>

            {subtitulo && <p className='SectionTitle__subtitulo'>{subtitulo}</p>}
        </header>
    )
}
