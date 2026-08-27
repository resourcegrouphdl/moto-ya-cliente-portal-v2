"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { CuentaPortalCliente } from "@/lib/types";

/**
 * Modal de bienvenida -- se muestra una sola vez, la primera vez que el cliente entra al dashboard
 * (`primerLoginCompletadoEn == null` en `GET /client/cuenta`). Ambas llamadas son best-effort: si la
 * consulta falla no se muestra nada (no vale la pena bloquear el dashboard por esto), y si el POST de
 * cierre falla igual se deja pasar -- el peor caso es que el modal vuelva a aparecer en el próximo login.
 */
export function OnboardingModal() {
  const [mostrar, setMostrar] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    let cancelado = false;
    apiGet<CuentaPortalCliente>("/client/cuenta")
      .then((cuenta) => {
        if (!cancelado && cuenta.primerLoginCompletadoEn === null) setMostrar(true);
      })
      .catch(() => {
        // best-effort -- ver javadoc de arriba
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const cerrar = async () => {
    setCerrando(true);
    try {
      await apiPost("/client/cuenta/completar-onboarding");
    } catch {
      // ver javadoc de arriba
    }
    setMostrar(false);
  };

  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-ink-50">Bienvenido a Mi Motoya</h2>
        <p className="mt-3 text-sm text-ink-300">
          Desde acá puedes ver el cronograma de tu crédito, tu saldo pendiente, subir tus comprobantes de
          pago y revisar tu historial -- todo en un solo lugar, cuando quieras.
        </p>
        <button
          type="button"
          onClick={cerrar}
          disabled={cerrando}
          className="mt-5 w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
