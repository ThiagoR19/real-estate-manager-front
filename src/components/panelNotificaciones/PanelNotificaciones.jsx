import { useState } from 'react';

import './PanelNotificaciones.css';

import Notificacion from '../notificacion/Notificacion';

import campanaIcono from '../../assets/icons/campanaNoti.svg';
import cerrarIcono from '../../assets/icons/closeNotis.svg';

const filtros = [
    { id: "todas", texto: "Todas", cumple: () => true },
    { id: "noLeidas", texto: "No leídas", cumple: (n) => !n.leida },
    { id: "leidas", texto: "Leídas", cumple: (n) => n.leida }
];

export default function PanelNotificaciones({ notificaciones: iniciales = [], onCerrar, className = "" }) {
    const [notificaciones, setNotificaciones] = useState(iniciales);
    const [filtro, setFiltro] = useState("todas");
    // id → si estaba sin leer al expandirla (esas se ven en azul oscuro; las ya leídas siguen en gris)
    const [expandidas, setExpandidas] = useState(() => new Map());

    const visibles = notificaciones.filter(filtros.find((f) => f.id === filtro).cumple);

    const marcarLeida = (id) => {
        setNotificaciones((lista) => lista.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    };

    const marcarTodas = () => {
        setNotificaciones((lista) => lista.map((n) => ({ ...n, leida: true })));
    };

    // Al expandir una notificación pasa a estar leída
    const alternar = (id) => {
        const abrir = !expandidas.has(id);
        const sinLeer = !notificaciones.find((n) => n.id === id).leida;

        setExpandidas((actuales) => {
            const nuevas = new Map(actuales);
            abrir ? nuevas.set(id, sinLeer) : nuevas.delete(id);
            return nuevas;
        });

        if (abrir) marcarLeida(id);
    };

    return (
        <section className={`PanelNotificaciones ${className}`} aria-labelledby="notificaciones-titulo">
            <header className='PanelNotificaciones__encabezado'>
                <h2 className='PanelNotificaciones__titulo' id="notificaciones-titulo">
                    <span className='PanelNotificaciones__campana'><img src={campanaIcono} alt="" /></span>
                    Notificaciones
                </h2>

                <button type="button" className='PanelNotificaciones__cerrar' onClick={onCerrar} aria-label="Cerrar notificaciones">
                    <img src={cerrarIcono} alt="" />
                </button>
            </header>

            <button type="button" className='PanelNotificaciones__marcar' onClick={marcarTodas}>
                Marcar todo como leído
            </button>

            <div className='PanelNotificaciones__filtros' role="group" aria-label="Filtrar notificaciones">
                {filtros.map(({ id, texto, cumple }) => (
                    <button
                        key={id}
                        type="button"
                        className={`PanelNotificaciones__filtro ${filtro === id ? "PanelNotificaciones__filtro--activo" : ""}`}
                        aria-pressed={filtro === id}
                        onClick={() => setFiltro(id)}
                    >
                        {texto}
                        <span className='PanelNotificaciones__contador'>{notificaciones.filter(cumple).length}</span>
                    </button>
                ))}
            </div>

            <div className='PanelNotificaciones__lista'>
                {visibles.length === 0 ? (
                    <p className='PanelNotificaciones__vacio'>No hay notificaciones para mostrar</p>
                ) : (
                    visibles.map((notificacion) => (
                        <Notificacion
                            key={notificacion.id}
                            notificacion={notificacion}
                            expandida={expandidas.has(notificacion.id)}
                            destacada={expandidas.get(notificacion.id) === true}
                            onAlternar={() => alternar(notificacion.id)}
                        />
                    ))
                )}
            </div>
        </section>
    )
}
