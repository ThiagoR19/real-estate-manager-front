import { useState } from 'react';

import { ModalOverlay, NotificationPanel } from "../../components";

import './NotificationDemo.css';

// Página solo de desarrollo (ruta /demo/notificaciones) para probar el panel
// TODO: reemplazar por los datos de la API
import notificaciones from '../../data/notifications';

export default function NotificationDemo() {
    const [abierto, setAbierto] = useState(true);

    return (
        <main className='NotificationDemo'>
            <button type="button" className='NotificationDemo__boton' onClick={() => setAbierto(true)}>
                Ver notificaciones
            </button>

            <ModalOverlay abierto={abierto} onCerrar={() => setAbierto(false)} posicion="derecha" etiqueta="Notificationes">
                <NotificationPanel notificaciones={notificaciones} onCerrar={() => setAbierto(false)} />
            </ModalOverlay>
        </main>
    )
}
