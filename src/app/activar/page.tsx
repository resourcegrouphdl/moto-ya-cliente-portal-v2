"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useValorClienteSolo } from "@/lib/use-valor-cliente-solo";

type Estado = "pidiendoCorreo" | "completando" | "error" | "linkInvalido";

const correoSchema = z.object({ email: z.string().email("Ingresa un correo válido") });
type CorreoForm = z.infer<typeof correoSchema>;

/**
 * Completa el sign-in passwordless -- el cliente llega acá desde el link que le mandamos por correo
 * (ver `PORTAL_CLIENTE_ACTIVACION_URL` en api-gateway). El caso normal es que lo abra en OTRO
 * dispositivo/navegador del que pidió el acceso -- Firebase no manda el correo dentro del link por
 * seguridad, así que si no lo tenemos guardado localmente, hay que pedirlo a mano.
 *
 * <p>`esLinkDeActivacion`/`emailGuardado` tocan `window`/Firebase Auth -- inseguro leerlos directo en
 * el cuerpo del componente porque este proyecto exporta estático (`output: "export"`) y Next.js sigue
 * prerenderizando server-side antes de exportar, donde `window` no existe. `useValorClienteSolo`
 * (`useSyncExternalStore`) resuelve esto sin un `useEffect` que dispare `setState` síncrono (que la
 * regla `react-hooks/set-state-in-effect` de este proyecto rechaza, ver AGENTS.md) — el valor real recién
 * se lee en el navegador, sin desajuste de hidratación. El resto de las transiciones de estado (después
 * del primer cálculo) sí son un `useState` normal, mutado desde el envío del formulario o desde el
 * intento automático de completar el acceso.
 */
export default function ActivarPage() {
  const router = useRouter();
  const { completarAcceso, esLinkDeActivacion, emailGuardado, isAuthenticated } = useAuth();

  const emailInicial = useValorClienteSolo(emailGuardado, () => null);
  const estadoDetectado = useValorClienteSolo(
    (): Estado => {
      if (!esLinkDeActivacion()) return "linkInvalido";
      return emailGuardado() ? "completando" : "pidiendoCorreo";
    },
    () => "pidiendoCorreo",
  );
  const [estadoManual, setEstadoManual] = useState<Estado | null>(null);
  const estado = estadoManual ?? estadoDetectado;

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CorreoForm>({ resolver: zodResolver(correoSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
      return;
    }
    if (estado !== "completando" || !emailInicial) return;

    let cancelado = false;
    (async () => {
      try {
        await completarAcceso(emailInicial);
        // El backend espera esta llamada justo después del sign-in -- crea/marca activada la cuenta
        // (idempotente, WHERE ... IS NULL del lado del repositorio).
        await apiPost("/client/cuenta/activar");
        if (!cancelado) router.replace("/dashboard");
      } catch {
        if (!cancelado) {
          setError("No pudimos completar tu ingreso. Verifica que el correo sea el mismo que pidió el acceso, o solicita un enlace nuevo.");
          setEstadoManual("error");
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [isAuthenticated, estado, emailInicial, completarAcceso, router]);

  const onSubmit = async (data: CorreoForm) => {
    setEstadoManual("completando");
    setError(null);
    try {
      await completarAcceso(data.email);
      await apiPost("/client/cuenta/activar");
      router.replace("/dashboard");
    } catch {
      setError("No pudimos completar tu ingreso. Verifica que el correo sea el mismo que pidió el acceso, o solicita un enlace nuevo.");
      setEstadoManual("error");
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-900/60 p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-ink-50">Mi Motoya</h1>

        {estado === "completando" && <p className="mt-6 text-sm text-ink-400">Completando tu ingreso…</p>}

        {estado === "linkInvalido" && (
          <div className="mt-6 text-sm text-ink-300">
            <p>Este enlace ya no es válido o expiró.</p>
            <a href="/login" className="mt-3 inline-block text-brand-400 hover:underline">
              Pedir un enlace nuevo
            </a>
          </div>
        )}

        {(estado === "pidiendoCorreo" || estado === "error") && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
            <p className="text-sm text-ink-400">Para confirmar que eres tú, escribe el correo al que te mandamos este enlace.</p>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-ink-300">
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-ink-50 outline-none focus:border-brand-500"
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400"
            >
              Continuar
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
