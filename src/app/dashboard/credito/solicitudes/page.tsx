"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { EstadoMora } from "@/lib/types";
import { CreditoTabs } from "@/components/CreditoTabs";
import { SolicitarCondonacionForm } from "@/components/SolicitarCondonacionForm";
import { SolicitarReprogramacionForm } from "@/components/SolicitarReprogramacionForm";

function SolicitudesContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contratoId = searchParams.get("contratoId");

  const [estadoMora, setEstadoMora] = useState<EstadoMora | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (id: string) => {
    try {
      const resp = await apiGet<EstadoMora>(`/client/creditos/${id}/cuotas-en-mora`);
      setEstadoMora(resp);
    } catch {
      setError("No se pudo cargar el estado de tu cuenta.");
    }
  }, []);

  useEffect(() => {
    if (!contratoId) {
      router.replace("/dashboard");
      return;
    }
    // IIFE en vez de llamar a `cargar` directo -- el linter (React Compiler) marca como error cualquier
    // función definida en el componente que mute estado, llamada sincrónicamente en el cuerpo de un
    // efecto, aunque sea async (ver AGENTS.md / mismo criterio que `/activar`).
    void (async () => {
      await cargar(contratoId);
    })();
  }, [contratoId, router, cargar]);

  if (!contratoId) return null;

  return (
    <div className="flex flex-col gap-6">
      <CreditoTabs contratoId={contratoId} />

      <div>
        <h1 className="text-lg font-semibold text-ink-50">Solicitudes</h1>
        <p className="mt-1 text-sm text-ink-400">
          Pide una condonación de mora o reprogramar tus próximas cuotas -- un asesor revisa cada solicitud antes
          de aplicarla.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {!error && estadoMora === null && <p className="text-sm text-ink-400">Cargando…</p>}

      {estadoMora && !estadoMora.tieneCasoAbierto && (
        <p className="text-sm text-ink-400">Estás al día -- no tienes cuotas en mora para solicitar una condonación o reprogramación.</p>
      )}

      {estadoMora?.tieneCasoAbierto && estadoMora.tieneSolicitudPendiente && (
        <p className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-300">
          Ya tienes una solicitud pendiente de revisión. Espera la respuesta antes de enviar otra.
        </p>
      )}

      {estadoMora?.tieneCasoAbierto && !estadoMora.tieneSolicitudPendiente && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SolicitarCondonacionForm contratoId={contratoId} cuotasEnMora={estadoMora.cuotasEnMora} onEnviado={() => cargar(contratoId)} />
          <SolicitarReprogramacionForm contratoId={contratoId} cuotasEnMora={estadoMora.cuotasEnMora} onEnviado={() => cargar(contratoId)} />
        </div>
      )}
    </div>
  );
}

export default function SolicitudesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-400">Cargando…</p>}>
      <SolicitudesContenido />
    </Suspense>
  );
}
