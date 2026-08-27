"use client";

import Link from "next/link";
import { useState } from "react";
import { enviarMensajeCliente } from "@/lib/mensajeria";
import { motivoPorTexto } from "@/lib/mensajeria-motivos";
import type { Conversacion, Mensaje } from "@/lib/mensajeria-types";

const ESTADO_LABEL: Record<Conversacion["estado"], string> = {
  ABIERTA: "Abierta",
  EN_ATENCION: "En atención",
  CERRADA: "Cerrada",
};

const ACCION_CTA: Record<"condonacion" | "reprogramacion" | "subir_comprobante", { texto: string; ruta: (contratoId: string) => string }> = {
  condonacion: { texto: "Ir al formulario de condonación", ruta: (id) => `/dashboard/credito/solicitudes?contratoId=${id}` },
  reprogramacion: { texto: "Ir al formulario de reprogramación", ruta: (id) => `/dashboard/credito/solicitudes?contratoId=${id}` },
  subir_comprobante: { texto: "Subir mi comprobante de pago", ruta: (id) => `/dashboard/credito?contratoId=${id}` },
};

/**
 * Hilo ya iniciado -- mensajes + caja de respuesta. Sin selector de motivo (spec §6: se elige una sola
 * vez, al iniciar) y sin adjunto en la respuesta (mismo criterio que la caja de respuesta del asesor en
 * admin-v2, `conversacion.component.html`: solo texto).
 *
 * <p>Si el motivo original tiene una acción especial (condonación/reprogramación/comprobante), se
 * muestra como una tarjeta fija arriba del hilo en vez de reimplementar el formulario acá -- apunta a
 * las pantallas ya construidas (`/dashboard/credito/solicitudes`, `/dashboard/credito`), nunca duplica
 * el use case real de Cobranza. El `contratoId` sale del primer mensaje (`creditoContratoId`), el único
 * que lo lleva -- `Conversacion` en sí no guarda el crédito, es un hilo por cliente, no por crédito.
 */
export function HiloConversacion({
  clienteId,
  conversacion,
  mensajes,
}: {
  clienteId: string;
  conversacion: Conversacion;
  mensajes: Mensaje[];
}) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const motivo = motivoPorTexto(conversacion.motivoActual);
  const contratoIdOriginal = mensajes.find((m) => m.creditoContratoId !== null)?.creditoContratoId ?? null;
  // Se arma junto con contratoIdOriginal (no por separado) para que TS lo mantenga no-nulo al usarlo abajo.
  const cta =
    motivo?.accion && contratoIdOriginal
      ? { ...ACCION_CTA[motivo.accion], href: ACCION_CTA[motivo.accion].ruta(contratoIdOriginal) }
      : null;

  const enviar = async () => {
    if (!texto.trim()) return;
    setEnviando(true);
    setError(null);
    try {
      await enviarMensajeCliente({ clienteId, texto: texto.trim() });
      setTexto("");
    } catch {
      setError("No se pudo enviar tu mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-ink-800 bg-ink-900/40 p-4">
        <div>
          <p className="text-xs text-ink-400">{ESTADO_LABEL[conversacion.estado]}</p>
          <p className="mt-1 text-sm text-ink-200">{conversacion.motivoActual}</p>
        </div>
        {conversacion.asesorEnAtencionNombre && (
          <p className="text-xs text-ink-500">Te atiende: {conversacion.asesorEnAtencionNombre}</p>
        )}
      </div>

      {cta && (
        <Link
          href={cta.href}
          className="rounded-xl border border-brand-500/60 bg-brand-500/10 p-4 text-sm text-brand-300 transition-colors hover:border-brand-400"
        >
          {cta.texto} →
        </Link>
      )}

      <div className="flex flex-col gap-2 rounded-2xl border border-ink-800 bg-ink-900/40 p-4">
        {mensajes.length === 0 ? (
          <p className="text-sm text-ink-400">Todavía no hay mensajes.</p>
        ) : (
          mensajes.map((m) => (
            <div key={m.id} className={`flex ${m.autor === "CLIENTE" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  m.autor === "CLIENTE" ? "bg-brand-500 text-ink-950" : "bg-ink-800 text-ink-100"
                }`}
              >
                <p>{m.texto}</p>
                {m.adjuntoStoragePath && <p className="mt-1 text-xs opacity-70">📎 Adjunto enviado</p>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !enviando) enviar();
          }}
          placeholder="Escribe una respuesta…"
          className="flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={enviar}
          disabled={enviando || !texto.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
        >
          Enviar
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
