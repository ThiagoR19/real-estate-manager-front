import { useState } from 'react';

import { ModalOverlay, NotificationPanel } from '../../components';

import './NotificationDemo.css';

// Página solo de desarrollo (ruta /demo/notificaciones) para probar el panel
// TODO: reemplazar por los datos de la API
const notificaciones = [
    {
        id: 1, tipo: "vencimiento", hace: "Hace 10 min", leida: false,
        titulo: "Contrato próximo a vencer",
        resumen: "El contrato de alquiler de Lucía Díaz en Av. San Martín 1250 expira en 30 días (28/02/2026)",
        detalle: ["Inquilino: Lucía Díaz", "Propiedad: Av. San Martín 1250, Depto. 3B", "Vence: 28/02/2026"]
    },
    {
        id: 2, tipo: "visita", hace: "Hace 10 min", leida: false,
        titulo: "Mañana hay una visita",
        resumen: "Mañana 19/10/26 hay una visita en Bielke 747, a las 13:40 hs.",
        detalle: ["Interesado: Juan Pérez", "Teléfono: 11 2345-6789"]
    },
    {
        id: 3, tipo: "reporte", hace: "Hace 10 min", leida: true,
        titulo: "Reporte de inquilino",
        resumen: "Matías Hernán reportó un problema de plomería",
        detalle: [
            "Inquilino: Matías Hernán",
            "Categoría: Plomería",
            "Reporte: Al tirar la cadena el baño empieza a saltar agua para todos lados, y luego empieza toda la casa a oler mal",
            "Fecha: 10/10/2026",
            "Imágenes: 4"
        ]
    },
    {
        id: 4, tipo: "vencimiento", hace: "Hace 2 h", leida: false,
        titulo: "Pago atrasado",
        resumen: "El pago de octubre de Av. Cabildo 2450 lleva 5 días de atraso",
        detalle: ["Inquilino: Carla Gómez", "Monto: $480.000"]
    },
    {
        id: 5, tipo: "visita", hace: "Hace 3 h", leida: true,
        titulo: "Visita confirmada",
        resumen: "Se confirmó la visita del jueves en Gorriti 4870 a las 10:00 hs.",
        detalle: ["Interesada: Ana Ruiz"]
    },
    {
        id: 6, tipo: "reporte", hace: "Ayer", leida: false,
        titulo: "Reporte de inquilino",
        resumen: "Pedro Sosa reportó un problema eléctrico",
        detalle: ["Inquilino: Pedro Sosa", "Categoría: Electricidad", "Reporte: Se corta la luz al encender el horno", "Fecha: 18/10/2026"]
    },
    {
        id: 7, tipo: "vencimiento", hace: "Ayer", leida: true,
        titulo: "Contrato renovado",
        resumen: "Se renovó el contrato de Ayacucho 1650 hasta el 31/03/2027",
        detalle: ["Inquilino: Martín López"]
    },
    {
        id: 8, tipo: "visita", hace: "Hace 2 días", leida: true,
        titulo: "Visita cancelada",
        resumen: "El interesado canceló la visita en Av. Rivadavia 5100",
        detalle: ["Interesado: Diego Fernández"]
    },
    {
        id: 9, tipo: "reporte", hace: "Hace 3 días", leida: true,
        titulo: "Reporte resuelto",
        resumen: "Se cerró el reporte de humedad en Av. del Libertador 7200",
        detalle: ["Categoría: Humedad", "Resuelto por: Plomería Sur"]
    }
];

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
