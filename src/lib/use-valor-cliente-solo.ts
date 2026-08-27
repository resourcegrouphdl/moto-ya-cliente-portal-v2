import { useSyncExternalStore } from "react";

const SIN_SUSCRIPCION = () => () => {};

/**
 * Para leer una API del navegador (Firebase Auth, `localStorage`, `window.location`) de forma segura
 * durante el prerender estático (`output: "export"` -- Next.js sigue prerenderizando server-side antes
 * de exportar el HTML, y ahí `window` no existe). `getServerSnapshot` es lo que se usa en ese prerender
 * (nunca lo ve un usuario real, solo evita el crash); `getSnapshot` es el valor real, leído recién en el
 * navegador. Ninguno de los dos valores "cambia" después del primer cálculo en este proyecto (no hay
 * nada externo a lo que suscribirse de verdad), así que `subscribe` no hace nada -- eso es justo lo que
 * separa esto de un `useState` + `useEffect(() => setEstado(...), [])`: ese patrón dispara un
 * `setState` síncrono dentro del efecto, que la regla `react-hooks/set-state-in-effect` de este
 * proyecto (React Compiler, ver AGENTS.md) rechaza. `useSyncExternalStore` es la forma que React
 * recomienda para esto exactamente — sin efecto, sin desajuste de hidratación.
 */
export function useValorClienteSolo<T>(getSnapshot: () => T, getServerSnapshot: () => T): T {
  return useSyncExternalStore(SIN_SUSCRIPCION, getSnapshot, getServerSnapshot);
}
