"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MiMoto } from "@/lib/types";
import { CreditoTabs } from "@/components/CreditoTabs";

function MiMotoDetalle({ moto }: { moto: MiMoto }) {
  const campos: [string, string | number | null][] = [
    ["Marca", moto.marca],
    ["Modelo", moto.modelo],
    ["Año", moto.anio],
    ["Color", moto.color],
    ["N° de chasis", moto.numeroChasis],
    ["N° de motor", moto.numeroMotor],
  ];
  const hayDatos = campos.some(([, valor]) => valor !== null);

  return (
    <div className="flex flex-col gap-6">
      {moto.url && (
        <a
          href={moto.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block w-fit rounded-lg border border-ink-700 px-4 py-2 text-sm text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-50"
        >
          Ver documento de tu moto
        </a>
      )}
      {hayDatos ? (
        <dl className="grid gap-4 sm:grid-cols-2">
          {campos.map(([label, valor]) => (
            <div key={label} className="rounded-2xl border border-ink-800 bg-ink-900/40 p-4">
              <dt className="text-xs text-ink-400">{label}</dt>
              <dd className="mt-1 text-sm text-ink-50">{valor ?? "—"}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-ink-400">Todavía no tenemos los datos de tu moto registrados.</p>
      )}
    </div>
  );
}

function MiMotoContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contratoId = searchParams.get("contratoId");

  const [moto, setMoto] = useState<MiMoto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contratoId) {
      router.replace("/dashboard");
      return;
    }
    let cancelado = false;
    apiGet<MiMoto>(`/client/creditos/${contratoId}/mi-moto`)
      .then((resp) => {
        if (!cancelado) setMoto(resp);
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar la información de tu moto.");
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
      {!error && moto === null && <p className="text-sm text-ink-400">Cargando…</p>}
      {moto && <MiMotoDetalle moto={moto} />}
    </div>
  );
}

export default function MiMotoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-400">Cargando…</p>}>
      <MiMotoContenido />
    </Suspense>
  );
}
