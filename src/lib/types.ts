/**
 * Espejo, del lado del cliente, de `EstadoPagoCuota` (motoya-api, `cobranza.domain.model`) — mismos 4
 * valores, sin agregar ninguno nuevo acá. Si el backend agrega un estado, este archivo debe fallar la
 * build hasta que se actualice a propósito (unión cerrada, no `string`).
 */
export type EstadoPagoCuota = "PENDIENTE" | "VENCIDA" | "PARCIAL" | "PAGADA";
