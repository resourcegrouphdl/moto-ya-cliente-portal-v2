import type { EstadoPagoCuota } from "@/lib/types";

/**
 * Mismo texto/color que ya define el mockup de "Mi Crédito"
 * (https://claude.ai/code/artifact/e66d52cc-de0e-4904-b222-9b8ad68e8583) -- si el mockup cambia, este
 * mapa es lo primero que hay que actualizar para que no se desincronicen.
 *
 * `PENDIENTE` se muestra como "Al día" -- es el nombre que el backend usa (`EstadoPagoCuota`), pero el
 * cliente final nunca debería leer una palabra que suena a "todavía debes esto" para una cuota que ni
 * siquiera venció.
 */
const ESTILO_POR_ESTADO: Record<EstadoPagoCuota, { texto: string; color: string; fondo: string; borde: string }> = {
  PAGADA: { texto: "Pagada", color: "#6ee7b7", fondo: "rgba(16,185,129,0.14)", borde: "rgba(16,185,129,0.35)" },
  PENDIENTE: { texto: "Al día", color: "#9dc2df", fondo: "rgba(101,163,212,0.14)", borde: "rgba(101,163,212,0.35)" },
  PARCIAL: { texto: "Pago parcial", color: "#fcd34d", fondo: "rgba(245,158,11,0.14)", borde: "rgba(245,158,11,0.35)" },
  VENCIDA: { texto: "Vencida", color: "#fca5a5", fondo: "rgba(239,68,68,0.14)", borde: "rgba(239,68,68,0.35)" },
};

export function EstadoCuotaBadge({ estadoPago }: { estadoPago: EstadoPagoCuota }) {
  const estilo = ESTILO_POR_ESTADO[estadoPago];
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: "999px",
        color: estilo.color,
        background: estilo.fondo,
        border: `1px solid ${estilo.borde}`,
      }}
    >
      {estilo.texto}
    </span>
  );
}
