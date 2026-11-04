import { useEffect, useState } from 'react';

import wait from '../utils/wait';

// Si algo nunca termina (red caída, pestaña en segundo plano), el skeleton igual se va
const LIMITE_ESPERA = 8000;

// Resuelve cuando la imagen terminó de cargar (o falló): no usa img.decode()
// porque en pestañas en segundo plano puede quedar pendiente para siempre
const waitForImage = (img) => img.complete
    ? Promise.resolve()
    : new Promise((resolver) => {
        img.addEventListener('load', resolver, { once: true });
        img.addEventListener('error', resolver, { once: true });
    });

// Espera a que carguen las fuentes, todas las <img> dentro de `ref`
// y las imágenes extra (ej: fondos que se usan desde CSS).
export default function useLoadComplete(ref, extraImages = []) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let activo = true;

        // Las imágenes con loading="lazy" no se esperan: fuera de pantalla nunca terminarían de cargar
        const visibleImages = [...(ref.current?.querySelectorAll('img:not([loading="lazy"])') ?? [])].map(waitForImage);

        const backgroundImages = extraImages.map((src) => {
            const img = new Image();
            img.src = src;
            return waitForImage(img);
        });

        Promise.race([
            Promise.all([document.fonts.ready, ...visibleImages, ...backgroundImages]),
            wait(LIMITE_ESPERA)
        ]).then(() => {
            if (activo) setLoaded(true);
        });

        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return loaded;
}
