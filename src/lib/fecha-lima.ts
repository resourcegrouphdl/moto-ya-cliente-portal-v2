/**
 * El «hoy» de Moto Ya es el de Lima, siempre (DEC-006, ampliada en DEC-133).
 *
 * `new Date().toISOString().slice(0, 10)` da la fecha en UTC: entre las 7 pm y la medianoche de Lima ya es «mañana», y el formulario del voucher
 * prellenaba la fecha de la operación con el día siguiente. Una fecha de negocio sale de aquí, nunca de `toISOString()`.
 */
export const ZONA_LIMA = "America/Lima";

/** La fecha de hoy en Lima, `YYYY-MM-DD` (`en-CA` da el formato ISO directo). */
export function hoyLima(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_LIMA }).format(ahora);
}
