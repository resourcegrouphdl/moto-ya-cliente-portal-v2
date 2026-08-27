import type { CreditoResumen } from "./types";

/**
 * Créditos con contrato ya generado -- antes de eso (solicitud recién creada) no hay nada que mostrar en
 * "Mi Crédito" ni en el selector de crédito del chat (`lib/mensajeria-motivos.ts`, motivos que piden
 * elegir crédito). Extraído de `dashboard/page.tsx` (única lógica compartida, evita que el selector del
 * chat termine con un criterio distinto al del selector del dashboard).
 */
export function creditosConContrato(creditos: CreditoResumen[]): CreditoResumen[] {
  return creditos.filter((c) => c.contratoId !== null);
}
