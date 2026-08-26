import type { Prioridad } from "./mensajeria-types";

/**
 * Catálogo de motivos al iniciar una conversación (`portal-cliente-spec.md` §6, tabla "Motivo al iniciar
 * la conversación") -- no existía como código en ningún repo (ni siquiera admin-v2 lo necesitó: el
 * asesor solo lee `motivoActual` como texto libre). Vive acá porque es el cliente quien crea el hilo y
 * fija `motivoActual`/`prioridadActual`/`prioridadOrden` -- una sola vez, al primer mensaje (ver
 * lib/mensajeria.ts) -- las Security Rules bloquean cambiarlo después.
 */
export type IdMotivo =
  | "ya_pague"
  | "reclamo"
  | "reprogramar"
  | "condonacion"
  | "duda_cronograma"
  | "consulta_contrato"
  | "consulta_moto"
  | "beneficio"
  | "otro";

export type PoliticaAdjunto = "no" | "opcional" | "recomendado";

/**
 * Acción especial que dispara el motivo, más allá de la conversación libre -- ver decisión 2026-08-26
 * (memoria `motoyav2-portal-cliente-mi-credito`): estos 2 casos NUNCA reimplementan un formulario nuevo,
 * apuntan a lo que ya existe (`SolicitarCondonacionForm`/`SolicitarReprogramacionForm`,
 * `SubirComprobante`) -- el chat es solo la interfaz que los dispara.
 */
export type AccionMotivo = "condonacion" | "reprogramacion" | "subir_comprobante";

export interface MotivoConversacion {
  id: IdMotivo;
  /** Texto tal cual se guarda en `Conversacion.motivoActual`/`Mensaje.motivo` -- lo que ve el asesor en la bandeja. */
  texto: string;
  prioridad: Prioridad;
  adjunto: PoliticaAdjunto;
  pideElegirCredito: boolean;
  accion?: AccionMotivo;
}

/** ALTA primero -- mismo orden ascendente que ya usa `MensajeriaFirestoreService.bandeja` en admin-v2. */
export const PRIORIDAD_ORDEN: Record<Prioridad, number> = {
  ALTA: 0,
  MEDIA: 1,
  BAJA: 2,
};

export const MOTIVOS_CONVERSACION: readonly MotivoConversacion[] = [
  {
    id: "ya_pague",
    texto: "Ya pagué y el sistema no lo refleja",
    prioridad: "ALTA",
    adjunto: "opcional",
    pideElegirCredito: true,
    accion: "subir_comprobante",
  },
  {
    id: "reclamo",
    texto: "Reclamo o algo urgente/incorrecto",
    prioridad: "ALTA",
    adjunto: "opcional",
    pideElegirCredito: true,
  },
  {
    id: "reprogramar",
    texto: "Solicito reprogramar una cuota",
    prioridad: "MEDIA",
    adjunto: "opcional",
    pideElegirCredito: true,
    accion: "reprogramacion",
  },
  {
    id: "condonacion",
    texto: "Solicito condonación / revisión de mora",
    prioridad: "MEDIA",
    adjunto: "recomendado",
    pideElegirCredito: true,
    accion: "condonacion",
  },
  {
    id: "duda_cronograma",
    texto: "Duda sobre mi cronograma o saldo",
    prioridad: "BAJA",
    adjunto: "no",
    pideElegirCredito: true,
  },
  {
    id: "consulta_contrato",
    texto: "Consulta sobre mi contrato o documentos",
    prioridad: "BAJA",
    adjunto: "no",
    pideElegirCredito: true,
  },
  {
    id: "consulta_moto",
    texto: "Consulta sobre mi moto (SOAT, mantenimiento)",
    prioridad: "BAJA",
    adjunto: "no",
    pideElegirCredito: true,
  },
  {
    id: "beneficio",
    texto: "Me interesa un beneficio / otro producto o crédito",
    prioridad: "BAJA",
    adjunto: "no",
    pideElegirCredito: false,
  },
  {
    id: "otro",
    texto: "Otro",
    prioridad: "MEDIA",
    adjunto: "opcional",
    pideElegirCredito: false,
  },
] as const;

export function motivoPorId(id: IdMotivo): MotivoConversacion {
  const motivo = MOTIVOS_CONVERSACION.find((m) => m.id === id);
  if (!motivo) {
    throw new Error(`Motivo desconocido: ${id}`);
  }
  return motivo;
}
