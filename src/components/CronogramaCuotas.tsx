import { formatSoles } from "@/lib/format";
import type { CuotaCliente } from "@/lib/types";
import { DetallePagoParcial } from "./DetallePagoParcial";
import { EstadoCuotaBadge } from "./EstadoCuotaBadge";

function formatFecha(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

const FRECUENCIA_LABEL: Record<NonNullable<CuotaCliente["acuerdo"]>["frecuencia"], string> = {
  SEMANAL: "semanal",
  QUINCENAL: "quincenal",
  MENSUAL: "mensual",
};

/** Una cuota del cronograma — mismo markup que hoy; solo cambia el título si pertenece a un acuerdo de pago. */
function CuotaItem({ cuota }: { cuota: CuotaCliente }) {
  return (
    <li className="rounded-xl border border-ink-800 bg-ink-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink-50">
            {cuota.acuerdo ? `Cuota ${cuota.acuerdo.numeroEnAcuerdo} de ${cuota.acuerdo.totalEnAcuerdo}` : `Cuota ${cuota.numeroCuota}`}
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

      {(cuota.estadoPago === "VENCIDA" || cuota.estadoPago === "PARCIAL") && cuota.montoMora > 0 && (
        <p className="mt-2 text-xs text-red-300">
          {cuota.diasMora} día{cuota.diasMora === 1 ? "" : "s"} de mora — S/ {formatSoles(cuota.montoMora)} acumulados
        </p>
      )}
    </li>
  );
}

export function CronogramaCuotas({ cuotas }: { cuotas: CuotaCliente[] }) {
  if (cuotas.length === 0) {
    return <p className="text-sm text-ink-400">Todavía no hay cuotas generadas para este crédito.</p>;
  }

  const conAcuerdo = cuotas.filter((cuota) => cuota.acuerdo);
  if (conAcuerdo.length === 0) {
    return (
      <ul className="flex flex-col gap-2">
        {cuotas.map((cuota) => (
          <CuotaItem key={cuota.numeroCuota} cuota={cuota} />
        ))}
      </ul>
    );
  }

  const sinAcuerdo = cuotas.filter((cuota) => !cuota.acuerdo);
  const { totalEnAcuerdo, frecuencia } = conAcuerdo[0].acuerdo!;

  return (
    <div className="flex flex-col gap-4">
      {sinAcuerdo.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs uppercase text-ink-400">Tu crédito original</h3>
          <ul className="flex flex-col gap-2">
            {sinAcuerdo.map((cuota) => (
              <CuotaItem key={cuota.numeroCuota} cuota={cuota} />
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h3 className="text-xs uppercase text-ink-400">
          Acuerdo de pago · {FRECUENCIA_LABEL[frecuencia]} · {totalEnAcuerdo} cuotas
        </h3>
        <ul className="flex flex-col gap-2">
          {conAcuerdo.map((cuota) => (
            <CuotaItem key={cuota.numeroCuota} cuota={cuota} />
          ))}
        </ul>
      </section>
    </div>
  );
}
