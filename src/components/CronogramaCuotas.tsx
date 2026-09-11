import { formatSoles } from "@/lib/format";
import type { CuotaCliente } from "@/lib/types";
import { DetallePagoParcial } from "./DetallePagoParcial";
import { EstadoCuotaBadge } from "./EstadoCuotaBadge";

function formatFecha(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export function CronogramaCuotas({ cuotas }: { cuotas: CuotaCliente[] }) {
  if (cuotas.length === 0) {
    return <p className="text-sm text-ink-400">Todavía no hay cuotas generadas para este crédito.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {cuotas.map((cuota) => (
        <li key={cuota.numeroCuota} className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink-50">
                Cuota {cuota.numeroCuota}
                {cuota.montoRefinanciado && (
                  <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-normal text-blue-300">Refinanciada</span>
                )}
              </p>
              <p className="text-xs text-ink-400">{formatFecha(cuota.fechaVencimiento)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink-200">S/ {formatSoles(cuota.montoCuota)}</span>
              <EstadoCuotaBadge estadoPago={cuota.estadoPago} />
            </div>
          </div>

          {cuota.estadoPago === "PARCIAL" && (
            <div className="mt-2">
              <DetallePagoParcial montoCuota={cuota.montoCuota} montoPagado={cuota.montoPagado ?? 0} />
            </div>
          )}

          {cuota.estadoPago === "VENCIDA" && cuota.montoMora > 0 && (
            <p className="mt-2 text-xs text-red-300">
              {cuota.diasMora} día{cuota.diasMora === 1 ? "" : "s"} de mora — S/ {formatSoles(cuota.montoMora)} acumulados
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
