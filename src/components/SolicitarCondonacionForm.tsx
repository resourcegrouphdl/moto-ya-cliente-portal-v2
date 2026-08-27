"use client";

import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import { formatSoles } from "@/lib/format";
import type { CuotaEnMora, SolicitudCobranzaCliente } from "@/lib/types";
import { SubirEvidencia } from "./SubirEvidencia";

type Fase = "formulario" | "enviando" | "enviado" | "error";

/** BC-09 Fase 4/5 -- `POST /client/creditos/{id}/condonaciones`. Nace siempre PENDIENTE_APROBACION (maker-checker). */
export function SolicitarCondonacionForm({
  contratoId,
  cuotasEnMora,
  onEnviado,
}: {
  contratoId: string;
  cuotasEnMora: CuotaEnMora[];
  onEnviado: () => void;
}) {
  const [numeroCuota, setNumeroCuota] = useState(cuotasEnMora[0]?.numeroCuota ?? 1);
  const [monto, setMonto] = useState(String(cuotasEnMora[0]?.montoMora ?? ""));
  const [motivo, setMotivo] = useState("");
  const [evidenciaStoragePaths, setEvidenciaStoragePaths] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>("formulario");
  const [error, setError] = useState<string | null>(null);

  const cambiarCuota = (numero: number) => {
    setNumeroCuota(numero);
    const cuota = cuotasEnMora.find((c) => c.numeroCuota === numero);
    if (cuota) setMonto(String(cuota.montoMora));
  };

  const enviar = async () => {
    const montoNumero = Number(monto);
    if (!montoNumero || montoNumero <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    if (!motivo.trim()) {
      setError("Cuéntanos el motivo de tu solicitud.");
      return;
    }
    setFase("enviando");
    setError(null);
    try {
      await apiPost<SolicitudCobranzaCliente>(`/client/creditos/${contratoId}/condonaciones`, {
        numeroCuota,
        monto: montoNumero,
        motivo,
        evidenciaStoragePaths,
      });
      setFase("enviado");
      onEnviado();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo enviar tu solicitud. Intenta de nuevo.");
      setFase("error");
    }
  };

  if (fase === "enviado") {
    return (
      <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-5">
        <h2 className="text-sm font-medium text-emerald-300">Solicitud de condonación enviada</h2>
        <p className="mt-1 text-xs text-emerald-400/80">Un asesor la va a revisar -- te avisamos apenas tengamos una respuesta.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <h2 className="text-sm font-medium text-ink-50">Solicitar condonación de mora</h2>
      <p className="mt-1 text-xs text-ink-400">Pide que se te descuente parte o toda la mora acumulada de una cuota.</p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="condonacion-cuota" className="mb-1 block text-xs text-ink-300">
            Cuota
          </label>
          <select
            id="condonacion-cuota"
            value={numeroCuota}
            onChange={(e) => cambiarCuota(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          >
            {cuotasEnMora.map((c) => (
              <option key={c.numeroCuota} value={c.numeroCuota}>
                Cuota {c.numeroCuota} -- {c.diasMora} días de mora (S/ {formatSoles(c.montoMora)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="condonacion-monto" className="mb-1 block text-xs text-ink-300">
            Monto a condonar (S/)
          </label>
          <input
            id="condonacion-monto"
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="condonacion-motivo" className="mb-1 block text-xs text-ink-300">
            Motivo
          </label>
          <textarea
            id="condonacion-motivo"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-ink-300">Evidencia (opcional)</p>
          <SubirEvidencia contratoId={contratoId} categoria="condonaciones" onCambio={setEvidenciaStoragePaths} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={enviar}
          disabled={fase === "enviando"}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
        >
          {fase === "enviando" ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
    </div>
  );
}
