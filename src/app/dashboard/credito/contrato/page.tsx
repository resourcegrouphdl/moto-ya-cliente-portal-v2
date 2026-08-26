"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MiContrato } from "@/lib/types";
import { CreditoTabs } from "@/components/CreditoTabs";

function MiContratoContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contratoId = searchParams.get("contratoId");

  const [contrato, setContrato] = useState<MiContrato | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contratoId) {
      router.replace("/dashboard");
      return;
    }
    let cancelado = false;
    apiGet<MiContrato>(`/client/creditos/${contratoId}/mi-contrato`)
      .then((resp) => {
        if (!cancelado) setContrato(resp);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar tu contrato.");
      });
    return () => {
      cancelado = true;
    };
  }, [contratoId, router]);

  if (!contratoId) return null;

  return (
    <div className="flex flex-col gap-6">
      <CreditoTabs contratoId={contratoId} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!error && contrato === null && <p className="text-sm text-ink-400">Cargando…</p>}
      {contrato && (
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6">
          <h1 className="text-lg font-semibold text-ink-50">{contrato.numeroContrato}</h1>
          <p className="mt-1 text-sm text-ink-400">{contrato.estadoFormalizacion}</p>
          {contrato.documentoUrl ? (
            <a
              href={contrato.documentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400"
            >
              Ver contrato (PDF)
            </a>
          ) : (
            <p className="mt-5 text-sm text-ink-400">Tu contrato todavía no está disponible para descargar.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function MiContratoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-400">Cargando…</p>}>
      <MiContratoContenido />
    </Suspense>
  );
}
