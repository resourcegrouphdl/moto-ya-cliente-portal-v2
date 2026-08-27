"use client";

import { useState } from "react";
import { formatSoles } from "@/lib/format";
import type { EstadoVoucher, VoucherPago } from "@/lib/types";

const ESTADO_LABEL: Record<EstadoVoucher, string> = {
  PENDIENTE_VERIFICACION: "En revisión",
  VERIFICADO: "Verificado",
  RECHAZADO: "Rechazado",
};

const ESTADO_COLOR: Record<EstadoVoucher, string> = {
  PENDIENTE_VERIFICACION: "#fcd34d",
  VERIFICADO: "#6ee7b7",
  RECHAZADO: "#fca5a5",
};

function formatFecha(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export function HistorialPagos({
  vouchers,
  onVerArchivo,
}: {
  vouchers: VoucherPago[];
  onVerArchivo: (voucherId: string, tipo: "comprobante" | "constancia") => Promise<string>;
}) {
  const [cargando, setCargando] = useState<string | null>(null);

  const abrir = async (voucherId: string, tipo: "comprobante" | "constancia") => {
    setCargando(`${voucherId}-${tipo}`);
    try {
      const url = await onVerArchivo(voucherId, tipo);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setCargando(null);
    }
  };

  if (vouchers.length === 0) {
    return <p className="text-sm text-ink-400">Todavía no has subido ningún comprobante.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {vouchers.map((voucher) => (
        <li key={voucher.id} className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-50">S/ {formatSoles(voucher.monto)}</p>
              <p className="text-xs text-ink-400">
                {formatFecha(voucher.fechaOperacion)}
                {voucher.numerosCuota.length > 0 && ` · Cuota${voucher.numerosCuota.length > 1 ? "s" : ""} ${voucher.numerosCuota.join(", ")}`}
              </p>
            </div>
            <span
              className="rounded-full px-2 py-1 text-xs font-medium"
              style={{ color: ESTADO_COLOR[voucher.estado] }}
            >
              {ESTADO_LABEL[voucher.estado]}
            </span>
          </div>

          {voucher.estado === "RECHAZADO" && voucher.motivoRechazo && (
            <p className="mt-2 text-xs text-red-300">{voucher.motivoRechazo}</p>
          )}

          {(voucher.tieneArchivo || voucher.tieneConstancia) && (
            <div className="mt-3 flex gap-3 text-xs">
              {voucher.tieneArchivo && (
                <button
                  type="button"
                  onClick={() => abrir(voucher.id, "comprobante")}
                  disabled={cargando === `${voucher.id}-comprobante`}
                  className="text-brand-400 hover:underline disabled:opacity-60"
                >
                  {cargando === `${voucher.id}-comprobante` ? "Abriendo…" : "Ver comprobante"}
                </button>
              )}
              {voucher.tieneConstancia && (
                <button
                  type="button"
                  onClick={() => abrir(voucher.id, "constancia")}
                  disabled={cargando === `${voucher.id}-constancia`}
                  className="text-brand-400 hover:underline disabled:opacity-60"
                >
                  {cargando === `${voucher.id}-constancia` ? "Abriendo…" : "Ver constancia"}
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
