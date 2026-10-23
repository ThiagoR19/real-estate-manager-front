import { Link } from 'wouter';

import './LegalText.css';

export default function LegalText({ className = "" }) {
    return (
        <p className={`LegalText ${className}`}>
            Al ingresar aceptas nuestros <Link href="/terms" className='LegalText__link'>Términos</Link> y <Link href="/terms" className='LegalText__link'>políticas de Privacidad</Link>
        </p>
    )
}
