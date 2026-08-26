"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet, ApiError } from "@/lib/api";
import { formatSoles } from "@/lib/format";
import type { CreditoResumen } from "@/lib/types";

/** Créditos con contrato ya generado -- antes de eso (solicitud recién creada) no hay nada que mostrar en "Mi Crédito" todavía. */
function creditosConContrato(creditos: CreditoResumen[]): CreditoResumen[] {
  return creditos.filter((c) => c.contratoId !== null);
}

export default function DashboardPage() {
  const [creditos, setCreditos] = useState<CreditoResumen[] | null>(null);
  const [avalados, setAvalados] = useState<CreditoResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([apiGet<CreditoResumen[]>("/client/creditos"), apiGet<CreditoResumen[]>("/client/creditos-avalados")])
      .then(([mios, avaladosResp]) => {
        if (cancelado) return;
        setCreditos(mios);
        setAvalados(avaladosResp);
      })
      .catch((e) => {
        if (cancelado) return;
        setError(e instanceof ApiError ? e.message : "No se pudo cargar tu información. Intenta de nuevo en un momento.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (creditos === null || avalados === null) {
    return <p className="text-sm text-ink-400">Cargando…</p>;
  }

  const conContrato = creditosConContrato(creditos);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold text-ink-50">Mis créditos</h1>
        <p className="mt-1 text-sm text-ink-400">Selecciona un crédito para ver su cronograma, pagos y subir comprobantes.</p>

        {conContrato.length === 0 ? (
          <p className="mt-6 text-sm text-ink-400">Todavía no tienes un crédito con contrato firmado.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conContrato.map((credito) => (
              <Link
                key={credito.contratoId}
                href={`/dashboard/credito?contratoId=${credito.contratoId}`}
                className="block rounded-2xl border border-ink-800 bg-ink-900/40 p-5 transition-colors hover:border-brand-500"
              >
                <h2 className="text-sm font-medium text-ink-50">{credito.numeroContrato ?? "Contrato en trámite"}</h2>
                <p className="mt-2 text-xs text-ink-400">
                  {credito.precioVehiculo !== null ? `S/ ${formatSoles(credito.precioVehiculo)}` : "—"}
                </p>
                <p className="mt-1 text-xs text-ink-500">{credito.estadoCredito ?? credito.estadoFormalizacion ?? "—"}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {avalados.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-ink-200">Créditos que avalas</h2>
          <p className="mt-1 text-xs text-ink-500">Sin acceso a montos, cronograma ni documentos — solo estado general.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {avalados.map((credito) => (
              <div key={credito.solicitudId} className="rounded-2xl border border-ink-800 bg-ink-900/20 p-5">
                <h3 className="text-sm font-medium text-ink-100">{credito.numeroContrato ?? credito.codigoSolicitud}</h3>
                <p className="mt-1 text-xs text-ink-500">{credito.estadoCredito ?? credito.estadoFormalizacion ?? credito.estadoSolicitud}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
