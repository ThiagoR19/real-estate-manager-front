import { useEffect, useState } from 'react';

// Espera a que carguen las fuentes, todas las <img> dentro de `ref`
// y las imágenes extra (ej: fondos que se usan desde CSS).
export default function useCargaCompleta(ref, imagenesExtra = []) {
    const [cargado, setCargado] = useState(false);

    useEffect(() => {
        let activo = true;

        const decodificar = (img) => img.decode().catch(() => {});

        const imagenesVista = [...(ref.current?.querySelectorAll('img') ?? [])].map(decodificar);

        const imagenesFondo = imagenesExtra.map((src) => {
            const img = new Image();
            img.src = src;
            return decodificar(img);
        });

        Promise.all([document.fonts.ready, ...imagenesVista, ...imagenesFondo])
            .then(() => {
                if (activo) setCargado(true);
            });

        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return cargado;
}
