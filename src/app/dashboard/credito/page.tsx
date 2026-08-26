"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { formatSoles } from "@/lib/format";
import type { CreditoDetalle, CuotaCliente, VoucherPago } from "@/lib/types";
import { CreditoTabs } from "@/components/CreditoTabs";
import { CronogramaCuotas } from "@/components/CronogramaCuotas";
import { HistorialPagos } from "@/components/HistorialPagos";
import { SubirComprobante } from "@/components/SubirComprobante";

function saldoPendiente(cuotas: CuotaCliente[]): number {
  return cuotas
    .filter((c) => c.estadoPago !== "PAGADA")
    .reduce((total, c) => total + (c.montoCuota - (c.montoPagado ?? 0)) + c.montoMora, 0);
}

function proximaCuotaImpaga(cuotas: CuotaCliente[]): CuotaCliente | null {
  const impagas = cuotas.filter((c) => c.estadoPago !== "PAGADA").sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  return impagas[0] ?? null;
}

function MiCreditoContenido() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contratoId = searchParams.get("contratoId");

  const [detalle, setDetalle] = useState<CreditoDetalle | null>(null);
  const [cuotas, setCuotas] = useState<CuotaCliente[] | null>(null);
  const [vouchers, setVouchers] = useState<VoucherPago[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargarVouchers = useCallback(async (id: string) => {
    const lista = await apiGet<VoucherPago[]>(`/client/creditos/${id}/vouchers`);
    setVouchers(lista);
  }, []);

  useEffect(() => {
    if (!contratoId) {
      router.replace("/dashboard");
      return;
    }
    let cancelado = false;
    Promise.all([
      apiGet<CreditoDetalle>(`/client/creditos/${contratoId}`),
      apiGet<CuotaCliente[]>(`/client/creditos/${contratoId}/cuotas`),
      apiGet<VoucherPago[]>(`/client/creditos/${contratoId}/vouchers`),
    ])
      .then(([detalleResp, cuotasResp, vouchersResp]) => {
        if (cancelado) return;
        setDetalle(detalleResp);
        setCuotas(cuotasResp);
        setVouchers(vouchersResp);
      })
      .catch(() => {
        if (cancelado) return;
        setError("No se pudo cargar tu crédito. Intenta de nuevo en un momento.");
      });
    return () => {
      cancelado = true;
    };
  }, [contratoId, router]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!contratoId || detalle === null || cuotas === null || vouchers === null) {
    return <p className="text-sm text-ink-400">Cargando…</p>;
  }

  const proximaCuota = proximaCuotaImpaga(cuotas);
  const saldo = saldoPendiente(cuotas);

  return (
    <div className="flex flex-col gap-8">
      <CreditoTabs contratoId={contratoId} />

      <div>
        <h1 className="text-lg font-semibold text-ink-50">{detalle.numeroContrato}</h1>
        <p className="mt-1 text-sm text-ink-400">{detalle.estadoCredito ?? detalle.estadoFormalizacion}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-xs text-ink-400">Próximo pago</p>
          {proximaCuota ? (
            <>
              <p className="mt-1 text-2xl font-semibold text-ink-50">S/ {formatSoles(proximaCuota.montoCuota)}</p>
              <p className="mt-1 text-xs text-ink-400">
                Cuota {proximaCuota.numeroCuota} —{" "}
                {new Date(proximaCuota.fechaVencimiento + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-emerald-300">Estás al día — no tienes cuotas pendientes.</p>
          )}
        </div>
        <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
          <p className="text-xs text-ink-400">Saldo pendiente total</p>
          <p className="mt-1 text-2xl font-semibold text-ink-50">S/ {formatSoles(saldo)}</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-200">Subir comprobante de pago</h2>
        </div>
        <div className="mt-3">
          <SubirComprobante contratoId={contratoId} onRegistrado={() => cargarVouchers(contratoId)} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink-200">Cronograma de cuotas</h2>
        <div className="mt-3">
          <CronogramaCuotas cuotas={cuotas} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-ink-200">Historial de pagos</h2>
        <div className="mt-3">
          <HistorialPagos
            vouchers={vouchers}
            onVerArchivo={(voucherId, tipo) =>
              apiGet<{ url: string }>(`/client/creditos/${contratoId}/vouchers/${voucherId}/url-${tipo}`).then((r) => r.url)
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function MiCreditoPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-400">Cargando…</p>}>
      <MiCreditoContenido />
    </Suspense>
  );
}
