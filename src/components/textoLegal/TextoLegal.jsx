import { Link } from 'wouter';

import './TextoLegal.css';

export default function TextoLegal({ className = "" }) {
    return (
        <p className={`TextoLegal ${className}`}>
            Al ingresar aceptas nuestros <Link href="/terms" className='TextoLegal__link'>Términos</Link> y <Link href="/terms" className='TextoLegal__link'>políticas de Privacidad</Link>
        </p>
    )
}
