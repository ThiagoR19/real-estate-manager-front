import { useEffect, useState } from "react";

const LIMITE_ESPERA = 8000;

const waitForImage = (img) => img.complete ? Promise.resolve() : new Promise((resolver) => {
  img.addEventListener("load", resolver, { once: true });
  img.addEventListener("error", resolver, { once: true });
});


export default function useLoadComplete(ref, extraImages = []) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let activo = true;
    const visibleImages = [...(ref.current?.querySelectorAll('img:not([loading="lazy"])') ?? []),].map(waitForImage);

    const backgroundImages = extraImages.map((src) => {
      const img = new Image();
      img.src = src;
      return waitForImage(img);
    });

    const timeout = window.setTimeout(() => {
      if (activo) setLoaded(true);
    }, LIMITE_ESPERA);

    Promise.all([document.fonts.ready, ...visibleImages, ...backgroundImages]).then(() => {
      window.clearTimeout(timeout);
      if (activo) setLoaded(true);
    });

    return () => {
      activo = false;
      window.clearTimeout(timeout);
    };

  }, []);

  return loaded;
}
