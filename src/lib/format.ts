const formateadorSoles = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "150" -> "150.00", "2340" -> "2,340.00" -- sin el símbolo "S/", eso lo agrega quien lo use (a veces va separado en el layout). */
export function formatSoles(monto: number): string {
  return formateadorSoles.format(monto);
}
