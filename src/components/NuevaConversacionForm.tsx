"use client";

import { useState } from "react";
import { enviarMensajeCliente } from "@/lib/mensajeria";
import { MOTIVOS_CONVERSACION, motivoPorId, type IdMotivo } from "@/lib/mensajeria-motivos";
import type { CreditoResumen } from "@/lib/types";
import { SubirEvidencia } from "./SubirEvidencia";

interface PerfilParaConversacion {
  nombreCliente: string;
  documentoCliente: string;
  correoCliente: string;
}

/**
 * Primer mensaje de una conversación -- el único momento en que se elige motivo (spec §6: "Motivo AL
 * INICIAR la conversación", no un selector por mensaje; `firestore.rules` tampoco deja cambiarlo
 * después). El selector de crédito se muestra si el motivo lo pide, o si su política de adjunto no es
 * "no" (el único caso real: "Otro" -- no pide crédito, pero si el cliente adjunta algo, `evidencias/
 * url-subida` sí necesita un `contratoId` para resolver el caso).
 */
export function NuevaConversacionForm({
  clienteId,
  perfil,
  creditos,
  onEnviado,
}: {
  clienteId: string;
  perfil: PerfilParaConversacion;
  creditos: CreditoResumen[];
  onEnviado: () => void;
}) {
  const [motivoId, setMotivoId] = useState<IdMotivo>(MOTIVOS_CONVERSACION[0].id);
  const [contratoId, setContratoId] = useState<string>(creditos[0]?.contratoId ?? "");
  const [texto, setTexto] = useState("");
  const [adjuntoStoragePath, setAdjuntoStoragePath] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const motivo = motivoPorId(motivoId);
  const muestraSelectorCredito = motivo.pideElegirCredito || motivo.adjunto !== "no";
  const muestraAdjunto = motivo.adjunto !== "no" && contratoId !== "";

  const enviar = async () => {
    if (!texto.trim()) {
      setError("Escribe tu mensaje.");
      return;
    }
    if (motivo.pideElegirCredito && !contratoId) {
      setError("Selecciona a qué crédito se refiere.");
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await enviarMensajeCliente({
        clienteId,
        texto: texto.trim(),
        perfil,
        motivo,
        creditoContratoId: contratoId || null,
        adjuntoStoragePath,
      });
      onEnviado();
    } catch {
      setError("No se pudo enviar tu mensaje. Intenta de nuevo.");
      setEnviando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <h2 className="text-sm font-medium text-ink-50">Escríbenos</h2>
      <p className="mt-1 text-xs text-ink-400">Un asesor te responde apenas vea tu mensaje.</p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="motivo" className="mb-1 block text-xs text-ink-300">
            Motivo
          </label>
          <select
            id="motivo"
            value={motivoId}
            onChange={(e) => {
              setMotivoId(e.target.value as IdMotivo);
              setAdjuntoStoragePath(null);
            }}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          >
            {MOTIVOS_CONVERSACION.map((m) => (
              <option key={m.id} value={m.id}>
                {m.texto}
              </option>
            ))}
          </select>
        </div>

        {muestraSelectorCredito && (
          <div>
            <label htmlFor="credito" className="mb-1 block text-xs text-ink-300">
              Crédito {motivo.pideElegirCredito ? "" : "(opcional -- solo si vas a adjuntar algo)"}
            </label>
            <select
              id="credito"
              value={contratoId}
              onChange={(e) => {
                setContratoId(e.target.value);
                setAdjuntoStoragePath(null);
              }}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
            >
              <option value="">Sin especificar</option>
              {creditos.map((c) => (
                <option key={c.contratoId} value={c.contratoId ?? ""}>
                  {c.numeroContrato ?? c.codigoSolicitud}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="texto" className="mb-1 block text-xs text-ink-300">
            Mensaje
          </label>
          <textarea
            id="texto"
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>

        {muestraAdjunto && (
          <div>
            <p className="mb-1 text-xs text-ink-300">Adjunto ({motivo.adjunto === "recomendado" ? "recomendado" : "opcional"})</p>
            <SubirEvidencia
              contratoId={contratoId}
              categoria="mensajeria"
              onCambio={(paths) => setAdjuntoStoragePath(paths[0] ?? null)}
            />
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="button"
          onClick={enviar}
          disabled={enviando}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
        >
          {enviando ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
