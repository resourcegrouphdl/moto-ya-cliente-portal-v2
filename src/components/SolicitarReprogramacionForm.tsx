"use client";

import { useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import type { CuotaEnMora, SolicitudCobranzaCliente } from "@/lib/types";
import { SubirEvidencia } from "./SubirEvidencia";

type Fase = "formulario" | "enviando" | "enviado" | "error";

/**
 * BC-09 Fase 4/5 -- `POST /client/creditos/{id}/reprogramaciones`. A diferencia de la condonación, acá
 * la evidencia es obligatoria a nivel de dominio (`SolicitudReprogramacion.solicitar`) -- se valida acá
 * mismo antes de llamar al backend para no gastar un viaje de red en un 400 seguro.
 */
export function SolicitarReprogramacionForm({
  contratoId,
  cuotasEnMora,
  onEnviado,
}: {
  contratoId: string;
  cuotasEnMora: CuotaEnMora[];
  onEnviado: () => void;
}) {
  const [numeroCuotaDesde, setNumeroCuotaDesde] = useState(cuotasEnMora[0]?.numeroCuota ?? 1);
  const [diasACorrer, setDiasACorrer] = useState("15");
  const [motivo, setMotivo] = useState("");
  const [evidenciaStoragePaths, setEvidenciaStoragePaths] = useState<string[]>([]);
  const [fase, setFase] = useState<Fase>("formulario");
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    const dias = Number(diasACorrer);
    if (!dias || dias <= 0) {
      setError("Ingresa una cantidad de días válida.");
      return;
    }
    if (!motivo.trim()) {
      setError("Cuéntanos el motivo de tu solicitud.");
      return;
    }
    if (evidenciaStoragePaths.length === 0) {
      setError("Adjunta al menos un archivo de sustento.");
      return;
    }
    setFase("enviando");
    setError(null);
    try {
      await apiPost<SolicitudCobranzaCliente>(`/client/creditos/${contratoId}/reprogramaciones`, {
        numeroCuotaDesde,
        diasACorrer: dias,
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
        <h2 className="text-sm font-medium text-emerald-300">Solicitud de reprogramación enviada</h2>
        <p className="mt-1 text-xs text-emerald-400/80">Un asesor la va a revisar -- te avisamos apenas tengamos una respuesta.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <h2 className="text-sm font-medium text-ink-50">Solicitar reprogramación</h2>
      <p className="mt-1 text-xs text-ink-400">
        Pide correr la fecha de tus próximas cuotas -- necesitas adjuntar un sustento (por ejemplo, una boleta de
        pago o algún documento que respalde tu motivo).
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="reprogramacion-cuota" className="mb-1 block text-xs text-ink-300">
            Desde la cuota
          </label>
          <select
            id="reprogramacion-cuota"
            value={numeroCuotaDesde}
            onChange={(e) => setNumeroCuotaDesde(Number(e.target.value))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          >
            {cuotasEnMora.map((c) => (
              <option key={c.numeroCuota} value={c.numeroCuota}>
                Cuota {c.numeroCuota}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="reprogramacion-dias" className="mb-1 block text-xs text-ink-300">
            Días a correr
          </label>
          <input
            id="reprogramacion-dias"
            type="number"
            min={1}
            value={diasACorrer}
            onChange={(e) => setDiasACorrer(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="reprogramacion-motivo" className="mb-1 block text-xs text-ink-300">
            Motivo
          </label>
          <textarea
            id="reprogramacion-motivo"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <p className="mb-1 text-xs text-ink-300">Evidencia (obligatorio)</p>
          <SubirEvidencia contratoId={contratoId} categoria="reprogramaciones" onCambio={setEvidenciaStoragePaths} />
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
