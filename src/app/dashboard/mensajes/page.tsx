"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { creditosConContrato } from "@/lib/creditos";
import { suscribirConversacion, suscribirMensajes } from "@/lib/mensajeria";
import type { Conversacion, Mensaje } from "@/lib/mensajeria-types";
import type { CreditoResumen, CuentaPortalCliente, PerfilCliente } from "@/lib/types";
import { HiloConversacion } from "@/components/HiloConversacion";
import { NuevaConversacionForm } from "@/components/NuevaConversacionForm";

/**
 * Chat del cliente (BC-09 Fase 4) -- un hilo por cliente, no por crédito (spec §6), así que a diferencia
 * de `/dashboard/credito/**` esta página no depende de `contratoId` en la URL. `cuenta.clienteId`
 * (`GET /client/cuenta`) es el id real del documento en Firestore -- el mismo que ya llevan los custom
 * claims de Firebase Auth que gobiernan `firestore.rules`.
 */
export default function MensajesPage() {
  const { user } = useAuth();

  const [cuenta, setCuenta] = useState<CuentaPortalCliente | null>(null);
  const [perfil, setPerfil] = useState<PerfilCliente | null>(null);
  const [creditos, setCreditos] = useState<CreditoResumen[] | null>(null);
  // undefined = todavía sin resolver la suscripción; null = resuelta, sin conversación previa.
  const [conversacion, setConversacion] = useState<Conversacion | null | undefined>(undefined);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    Promise.all([
      apiGet<CuentaPortalCliente>("/client/cuenta"),
      apiGet<PerfilCliente>("/client/perfil"),
      apiGet<CreditoResumen[]>("/client/creditos"),
    ])
      .then(([cuentaResp, perfilResp, creditosResp]) => {
        if (cancelado) return;
        setCuenta(cuentaResp);
        setPerfil(perfilResp);
        setCreditos(creditosResp);
      })
      .catch(() => {
        if (cancelado) return;
        setError("No se pudo cargar tu información. Intenta de nuevo en un momento.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!cuenta) return;
    const dejarDeEscucharConversacion = suscribirConversacion(cuenta.clienteId, setConversacion);
    const dejarDeEscucharMensajes = suscribirMensajes(cuenta.clienteId, setMensajes);
    return () => {
      dejarDeEscucharConversacion();
      dejarDeEscucharMensajes();
    };
  }, [cuenta]);

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!cuenta || !perfil || !creditos || conversacion === undefined) {
    return <p className="text-sm text-ink-400">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-ink-50">Mensajes</h1>
        <p className="mt-1 text-sm text-ink-400">Escríbenos por acá para cualquier consulta sobre tu crédito.</p>
      </div>

      {conversacion ? (
        <HiloConversacion clienteId={cuenta.clienteId} conversacion={conversacion} mensajes={mensajes} />
      ) : (
        <NuevaConversacionForm
          clienteId={cuenta.clienteId}
          perfil={{
            nombreCliente: perfil.nombreCompleto,
            documentoCliente: perfil.numeroDocumento,
            correoCliente: user?.email ?? "",
          }}
          creditos={creditosConContrato(creditos)}
          onEnviado={() => {
            // No hace falta hacer nada acá -- la suscripción de arriba ya va a reflejar la conversación
            // recién creada apenas Firestore confirme el write, sin necesidad de refetch manual.
          }}
        />
      )}
    </div>
  );
}
