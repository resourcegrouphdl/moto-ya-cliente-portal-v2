import type { Timestamp } from "firebase/firestore";

/**
 * Espejo de `admin-v2/src/app/features/mensajeria/mensajeria.model.ts` -- mismo criterio que
 * `lib/types.ts` con los DTOs del backend: estas 2 interfaces viven en Firestore, gobernadas por
 * `admin-v2/firestore.rules`, y deben mantenerse idénticas en forma a las de admin-v2 (el chat es el
 * mismo documento leído/escrito desde 2 apps distintas -- si un campo cambia acá, cambia también allá).
 */
export type EstadoConversacion = "ABIERTA" | "EN_ATENCION" | "CERRADA";

export type Prioridad = "ALTA" | "MEDIA" | "BAJA";

export type AutorMensaje = "CLIENTE" | "ASESOR";

/** Doc id == clienteId (originacion.clientes.id) -- un hilo por cliente, no por crédito (spec §6). */
export interface Conversacion {
  clienteId: string;
  nombreCliente: string;
  documentoCliente: string;
  correoCliente: string;
  estado: EstadoConversacion;
  asesorEnAtencionUid: string | null;
  asesorEnAtencionNombre: string | null;
  motivoActual: string;
  prioridadActual: Prioridad;
  prioridadOrden: number;
  ultimoMensajeTexto: string;
  ultimoMensajeEn: Timestamp | null;
  ultimoMensajeAutor: AutorMensaje;
  creadaEn: Timestamp;
  cerradaEn: Timestamp | null;
}

/**
 * Subcolección `conversaciones/{clienteId}/mensajes` -- inmutable tras creación (ver firestore.rules).
 * `adjuntoStoragePath`: path de GCS bajo `cobranza/{casoId}/mensajeria/...`, nunca la URL firmada en sí
 * (se genera al vuelo bajo demanda) -- ver `SolicitarAccionCobranzaClienteUseCase` (motoya-api),
 * categoría `mensajeria` de `evidencias/url-subida`.
 */
export interface Mensaje {
  id: string;
  autor: AutorMensaje;
  autorUid: string;
  texto: string;
  motivo: string | null;
  creditoContratoId: string | null;
  adjuntoStoragePath: string | null;
  creadaEn: Timestamp | null;
}
