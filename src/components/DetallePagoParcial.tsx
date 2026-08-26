import { formatSoles } from "@/lib/format";

/**
 * UT-02 (portal-cliente-qa-plan.md §9) -- nunca un porcentaje solo, siempre el monto pagado, el total
 * y el faltante en soles explícitos (motoyav2-politica-pagos-parciales.md). `montoFaltante` se calcula
 * acá, nunca se recibe como prop, para que no pueda desincronizarse del monto realmente pagado.
 */
export function DetallePagoParcial({ montoCuota, montoPagado }: { montoCuota: number; montoPagado: number }) {
  const montoFaltante = montoCuota - montoPagado;

  return (
    <p style={{ fontSize: "13px", color: "#9aa7b6", margin: 0 }}>
      S/ {formatSoles(montoPagado)} de S/ {formatSoles(montoCuota)} pagado — te faltan S/ {formatSoles(montoFaltante)}
    </p>
  );
}
