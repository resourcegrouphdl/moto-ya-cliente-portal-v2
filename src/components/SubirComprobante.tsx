"use client";

import { useRef, useState } from "react";
import { apiPost, ApiError } from "@/lib/api";
import type { DatosVoucherExtraidos, SolicitudSubidaVoucher } from "@/lib/types";

type Fase = "cerrado" | "subiendo" | "confirmando" | "enviando" | "exito" | "error";

const TIPOS_ACEPTADOS = "image/jpeg,image/png,image/webp,image/heic,application/pdf";

interface FormularioVoucher {
  numeroCuota: number;
  monto: string;
  fechaOperacion: string;
  numeroOperacion: string;
  entidadOrigen: string;
}

/**
 * BC-09 Fase 3 §6.2 -- 3 pasos: pedir URL de subida (el backend ya resuelve-o-abre el caso servicing
 * si hace falta y sugiere la primera cuota impaga), subir el archivo directo a GCS (nunca pasa por
 * nuestro backend), y registrar. El OCR (extraer) es best-effort -- si falla, el cliente igual completa
 * el formulario a mano.
 */
export function SubirComprobante({ contratoId, onRegistrado }: { contratoId: string; onRegistrado: () => void }) {
  const [fase, setFase] = useState<Fase>("cerrado");
  const [error, setError] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [datosOcrCrudo, setDatosOcrCrudo] = useState<string | null>(null);
  const [form, setForm] = useState<FormularioVoucher>({
    numeroCuota: 1,
    monto: "",
    fechaOperacion: new Date().toISOString().slice(0, 10),
    numeroOperacion: "",
    entidadOrigen: "",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const abrirSelector = () => inputRef.current?.click();

  const alElegirArchivo = async (archivo: File | undefined) => {
    if (!archivo) return;
    setFase("subiendo");
    setError(null);
    try {
      const solicitud = await apiPost<SolicitudSubidaVoucher>(`/client/creditos/${contratoId}/vouchers/url-subida`, {
        nombreArchivo: archivo.name,
        contentType: archivo.type,
      });
      await subirArchivo(solicitud, archivo);
      setStoragePath(solicitud.storagePath);
      setForm((f) => ({ ...f, numeroCuota: solicitud.cuotaSugerida ?? f.numeroCuota }));
      await intentarExtraerDatos(solicitud.storagePath, archivo.type);
      setFase("confirmando");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo subir el archivo. Intenta de nuevo.");
      setFase("error");
    }
  };

  const subirArchivo = async (solicitud: SolicitudSubidaVoucher, archivo: File) => {
    const respuesta = await fetch(solicitud.uploadUrl, {
      method: "PUT",
      headers: { [solicitud.headerRequeridoNombre]: solicitud.headerRequeridoValor },
      body: archivo,
    });
    if (!respuesta.ok) throw new Error("No se pudo subir el archivo a almacenamiento.");
  };

  /** Nunca bloquea el flujo -- si el OCR falla o no encuentra nada, el cliente completa el formulario a mano igual. */
  const intentarExtraerDatos = async (path: string, tipo: string) => {
    try {
      const datos = await apiPost<DatosVoucherExtraidos>(`/client/creditos/${contratoId}/vouchers/extraer`, {
        storagePath: path,
        contentType: tipo,
      });
      setDatosOcrCrudo(datos.datosOcrCrudo);
      setForm((f) => ({
        ...f,
        monto: datos.monto !== null ? String(datos.monto) : f.monto,
        fechaOperacion: datos.fechaOperacion ?? f.fechaOperacion,
        numeroOperacion: datos.numeroOperacion ?? f.numeroOperacion,
        entidadOrigen: datos.entidadBancaria ?? f.entidadOrigen,
      }));
    } catch {
      // best-effort, sin bloquear el formulario
    }
  };

  const enviar = async () => {
    if (!storagePath) return;
    const monto = Number(form.monto);
    if (!monto || monto <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    setFase("enviando");
    setError(null);
    try {
      await apiPost(`/client/creditos/${contratoId}/vouchers`, {
        cuotas: [{ numeroCuota: form.numeroCuota, monto }],
        fechaOperacion: form.fechaOperacion,
        numeroOperacion: form.numeroOperacion || null,
        entidadOrigen: form.entidadOrigen || null,
        storagePath,
        datosOcrCrudo,
      });
      setFase("exito");
      onRegistrado();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo registrar el comprobante. Intenta de nuevo.");
      setFase("error");
    }
  };

  const cerrar = () => {
    setFase("cerrado");
    setStoragePath(null);
    setDatosOcrCrudo(null);
    setError(null);
    setForm({ numeroCuota: 1, monto: "", fechaOperacion: new Date().toISOString().slice(0, 10), numeroOperacion: "", entidadOrigen: "" });
  };

  if (fase === "cerrado") {
    return (
      <div>
        <button
          type="button"
          onClick={abrirSelector}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400"
        >
          Subir comprobante
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEPTADOS}
          className="hidden"
          onChange={(e) => alElegirArchivo(e.target.files?.[0])}
        />
      </div>
    );
  }

  if (fase === "subiendo") {
    return <p className="text-sm text-ink-400">Subiendo comprobante…</p>;
  }

  if (fase === "exito") {
    return (
      <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4">
        <p className="text-sm text-emerald-300">Recibimos tu comprobante. Lo estamos verificando y te confirmamos en breve.</p>
        <button type="button" onClick={cerrar} className="mt-3 text-xs text-brand-400 hover:underline">
          Subir otro comprobante
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/60 p-4">
      <h3 className="text-sm font-medium text-ink-50">Confirma los datos de tu pago</h3>
      <p className="mt-1 text-xs text-ink-400">Revisamos tu comprobante automáticamente — corrige lo que haga falta antes de enviarlo.</p>

      <div className="mt-4 flex flex-col gap-3">
        <div>
          <label htmlFor="numeroCuota" className="mb-1 block text-xs text-ink-300">
            N° de cuota
          </label>
          <input
            id="numeroCuota"
            type="number"
            min={1}
            value={form.numeroCuota}
            onChange={(e) => setForm((f) => ({ ...f, numeroCuota: Number(e.target.value) }))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="monto" className="mb-1 block text-xs text-ink-300">
            Monto (S/)
          </label>
          <input
            id="monto"
            type="number"
            step="0.01"
            value={form.monto}
            onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="fechaOperacion" className="mb-1 block text-xs text-ink-300">
            Fecha de operación
          </label>
          <input
            id="fechaOperacion"
            type="date"
            value={form.fechaOperacion}
            onChange={(e) => setForm((f) => ({ ...f, fechaOperacion: e.target.value }))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label htmlFor="numeroOperacion" className="mb-1 block text-xs text-ink-300">
            N° de operación (opcional)
          </label>
          <input
            id="numeroOperacion"
            type="text"
            value={form.numeroOperacion}
            onChange={(e) => setForm((f) => ({ ...f, numeroOperacion: e.target.value }))}
            className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={enviar}
            disabled={fase === "enviando"}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
          >
            {fase === "enviando" ? "Enviando…" : "Confirmar y enviar"}
          </button>
          <button type="button" onClick={cerrar} className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-ink-300 hover:border-ink-500">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

