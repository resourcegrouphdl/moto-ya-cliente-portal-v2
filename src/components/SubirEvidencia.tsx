"use client";

import { useRef, useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import type { SolicitudSubidaVoucher } from "@/lib/types";

interface Archivo {
  nombre: string;
  storagePath: string;
}

const TIPOS_ACEPTADOS = "image/jpeg,image/png,image/webp,image/heic,application/pdf";

/**
 * Subida de evidencia (justificantes) para condonación/reprogramación -- BC-09 Fase 3/5. A diferencia de
 * `SubirComprobante`, acá puede haber varios archivos y ninguno crea un `VoucherPago` -- solo terminan
 * como `evidenciaStoragePaths` del formulario que use este componente (ver
 * `SolicitarAccionCobranzaClienteUseCase.solicitarUrlSubidaEvidencia`, categoría restringida server-side
 * a `condonaciones`/`reprogramaciones`).
 */
export function SubirEvidencia({
  contratoId,
  categoria,
  onCambio,
}: {
  contratoId: string;
  categoria: "condonaciones" | "reprogramaciones";
  onCambio: (storagePaths: string[]) => void;
}) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agregar = async (archivo: File | undefined) => {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const solicitud = await apiPost<SolicitudSubidaVoucher>(`/client/creditos/${contratoId}/evidencias/url-subida`, {
        categoria,
        nombreArchivo: archivo.name,
        contentType: archivo.type,
      });
      const respuesta = await fetch(solicitud.uploadUrl, {
        method: "PUT",
        headers: { [solicitud.headerRequeridoNombre]: solicitud.headerRequeridoValor },
        body: archivo,
      });
      if (!respuesta.ok) throw new Error("No se pudo subir el archivo.");
      const nuevos = [...archivos, { nombre: archivo.name, storagePath: solicitud.storagePath }];
      setArchivos(nuevos);
      onCambio(nuevos.map((a) => a.storagePath));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo subir el archivo. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const quitar = (storagePath: string) => {
    const nuevos = archivos.filter((a) => a.storagePath !== storagePath);
    setArchivos(nuevos);
    onCambio(nuevos.map((a) => a.storagePath));
  };

  return (
    <div>
      {archivos.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {archivos.map((a) => (
            <li
              key={a.storagePath}
              className="flex items-center justify-between rounded-lg border border-ink-800 bg-ink-900/40 px-3 py-1.5 text-xs text-ink-300"
            >
              <span className="truncate">{a.nombre}</span>
              <button type="button" onClick={() => quitar(a.storagePath)} className="ml-2 shrink-0 text-ink-500 hover:text-red-400">
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="rounded-lg border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-50 disabled:opacity-60"
      >
        {subiendo ? "Subiendo…" : "Adjuntar archivo"}
      </button>
      <input ref={inputRef} type="file" accept={TIPOS_ACEPTADOS} className="hidden" onChange={(e) => agregar(e.target.files?.[0])} />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
