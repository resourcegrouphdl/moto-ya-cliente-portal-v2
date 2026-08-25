"use client";

import { useEffect } from "react";

/**
 * Registro del service worker (PWA, 2026-08-25) — montado una sola vez desde `layout.tsx`. Nunca debe
 * romper la app si el navegador no soporta service workers (Safari viejo, navegadores in-app de redes
 * sociales, etc.) -- degradado silencioso, ver PWA-01 en portal-cliente-qa-plan.md.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silencioso a propósito -- no hay nada útil que mostrarle al cliente si esto falla, y no debe
      // bloquear ni degradar el resto de la app (que funciona igual sin service worker, solo sin el
      // beneficio de carga instantánea en visitas repetidas).
    });
  }, []);

  return null;
}
