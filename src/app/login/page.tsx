"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const solicitarAccesoSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
});

type SolicitarAccesoForm = z.infer<typeof solicitarAccesoSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { solicitarAcceso, isAuthenticated, isResolving } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SolicitarAccesoForm>({ resolver: zodResolver(solicitarAccesoSchema) });

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const onSubmit = async (data: SolicitarAccesoForm) => {
    setError(null);
    setSubmitting(true);
    try {
      await solicitarAcceso(data.email);
      setEnviado(true);
    } catch (e) {
      // El endpoint nunca confirma/niega si el correo existe -- un error real acá es de red/servidor, no "correo no encontrado".
      setError(e instanceof ApiError ? e.message : "No se pudo enviar el enlace. Intenta de nuevo en un momento.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isResolving || isAuthenticated) return null;

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-900/60 p-8 shadow-xl">
        <h1 className="text-xl font-semibold text-ink-50">Mi Motoya</h1>
        <p className="mt-1 text-sm text-ink-400">Ingresa a tu portal de cliente</p>

        {enviado ? (
          <div className="mt-6 rounded-lg border border-ink-700 bg-ink-950 p-4 text-sm text-ink-200">
            <p>Si el correo está registrado, te enviamos un enlace de acceso.</p>
            <p className="mt-2 text-ink-400">Revisa tu bandeja de entrada (y spam) y ábrelo desde este dispositivo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
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
              disabled={submitting}
              className="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-ink-950 transition-colors hover:bg-brand-400 disabled:opacity-60"
            >
              {submitting ? "Enviando…" : "Enviarme un enlace de acceso"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
