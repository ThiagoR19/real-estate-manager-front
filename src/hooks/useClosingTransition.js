import { useCallback, useEffect, useRef, useState } from "react";

const CLOSE_TRANSITION_MS = 160;

export default function useClosingTransition(onClose) {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef(null);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(
    () => () => window.clearTimeout(closeTimer.current),
    [],
  );

  const close = useCallback(() => {
    if (closingRef.current) return;

    closingRef.current = true;
    setIsClosing(true);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    closeTimer.current = window.setTimeout(
      () => onCloseRef.current?.(),
      reduceMotion ? 0 : CLOSE_TRANSITION_MS,
    );
  }, []);

  return { isClosing, close };
}
