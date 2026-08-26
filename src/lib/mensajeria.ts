import {
  type Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { PRIORIDAD_ORDEN, type MotivoConversacion } from "./mensajeria-motivos";
import type { AutorMensaje, Conversacion, EstadoConversacion, Mensaje } from "./mensajeria-types";

/**
 * Chat del Portal Cliente (BC-09 Fase 4, `portal-cliente-spec.md` §6) -- lee/escribe Firestore directo
 * desde el navegador, gobernado por `admin-v2/firestore.rules` (custom claims `pool=cliente`+`clienteId`,
 * ya sincronizados al crear la cuenta). Mismo patrón que `MensajeriaFirestoreService` (admin-v2), pero
 * funciones sueltas en vez de una clase con inyección de Angular -- coherente con el resto de `lib/` en
 * este repo (`api.ts`, `format.ts`).
 *
 * <p>`process.env.NODE_ENV` distingue colección igual que `environment.production` distingue a admin-v2:
 * `next dev` corre en development (`develop-conversaciones`), cualquier `next build` -- incluida la build
 * real de producción en CI -- corre en production (`prod-conversaciones`). Ningún env var nuevo: es el
 * mismo mecanismo que Next.js ya fija solo.
 */
const COLECCION = process.env.NODE_ENV === "production" ? "prod-conversaciones" : "develop-conversaciones";

interface PerfilParaConversacion {
  nombreCliente: string;
  documentoCliente: string;
  correoCliente: string;
}

/** Lectura puntual (no en tiempo real) -- usada para decidir si el próximo mensaje inicia o continúa el hilo. */
export function obtenerConversacion(clienteId: string): Promise<Conversacion | null> {
  return getDoc(doc(db, COLECCION, clienteId)).then((snap) => (snap.exists() ? (snap.data() as Conversacion) : null));
}

/** Tiempo real -- `cb(null)` mientras el cliente no haya escrito su primer mensaje nunca. */
export function suscribirConversacion(clienteId: string, cb: (conversacion: Conversacion | null) => void): Unsubscribe {
  return onSnapshot(doc(db, COLECCION, clienteId), (snap) => cb(snap.exists() ? (snap.data() as Conversacion) : null));
}

/** Tiempo real, orden cronológico -- mismo criterio que `MensajeriaFirestoreService.mensajes` en admin-v2. */
export function suscribirMensajes(clienteId: string, cb: (mensajes: Mensaje[]) => void): Unsubscribe {
  const q = query(collection(db, COLECCION, clienteId, "mensajes"), orderBy("creadaEn", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Mensaje)));
}

/**
 * Punto de entrada ÚNICO para que el cliente mande un mensaje -- decide sola si es el primer contacto
 * (crea el hilo con el motivo elegido, {@link iniciarConversacion}) o si ya existe uno (lo continúa,
 * reabriendo si estaba `CERRADA`, {@link continuarConversacion}). La UI nunca debe llamar a esas 2
 * funciones por separado: así no hay forma de construir, ni por error, un write que intente cambiar
 * `motivoActual` a mitad de una conversación ya iniciada -- `firestore.rules` ya lo rechazaría (una vez
 * que el documento existe, `create` nunca vuelve a aplicar), pero es mejor no llegar a intentarlo.
 *
 * <p>{@code motivo} solo importa en el primer mensaje -- se ignora silenciosamente si la conversación ya
 * existe (spec §6: "Motivo al iniciar la conversación", no un selector por mensaje).
 */
export async function enviarMensajeCliente(params: {
  clienteId: string;
  texto: string;
  /** Solo hace falta si todavía no existe conversación -- ver el error de abajo si falta y sí hace falta. */
  perfil?: PerfilParaConversacion;
  motivo?: MotivoConversacion;
  creditoContratoId?: string | null;
  adjuntoStoragePath?: string | null;
}): Promise<void> {
  const { clienteId, texto, perfil, motivo, creditoContratoId = null, adjuntoStoragePath = null } = params;
  const existente = await obtenerConversacion(clienteId);
  if (!existente) {
    if (!perfil || !motivo) {
      // No debería pasar nunca desde la UI (el formulario de primer mensaje siempre los arma) -- defensivo,
      // mejor este error claro que un batch.set con campos undefined.
      throw new Error("Falta perfil/motivo para iniciar una conversación nueva.");
    }
    return iniciarConversacion({ clienteId, texto, perfil, motivo, creditoContratoId, adjuntoStoragePath });
  }
  return continuarConversacion({
    clienteId,
    texto,
    estadoActual: existente.estado,
    creditoContratoId,
    adjuntoStoragePath,
  });
}

function uidActualORequerido(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sesión sin uid -- no se puede escribir en el chat.");
  return uid;
}

/** Primer mensaje de siempre para este cliente -- crea `Conversacion` + el mensaje, en un solo batch. */
async function iniciarConversacion(params: {
  clienteId: string;
  texto: string;
  perfil: PerfilParaConversacion;
  motivo: MotivoConversacion;
  creditoContratoId: string | null;
  adjuntoStoragePath: string | null;
}): Promise<void> {
  const { clienteId, texto, perfil, motivo, creditoContratoId, adjuntoStoragePath } = params;
  const uid = uidActualORequerido();
  const autor: AutorMensaje = "CLIENTE";

  const batch = writeBatch(db);
  batch.set(doc(db, COLECCION, clienteId), {
    clienteId,
    nombreCliente: perfil.nombreCliente,
    documentoCliente: perfil.documentoCliente,
    correoCliente: perfil.correoCliente,
    estado: "ABIERTA" satisfies EstadoConversacion,
    asesorEnAtencionUid: null,
    asesorEnAtencionNombre: null,
    motivoActual: motivo.texto,
    prioridadActual: motivo.prioridad,
    prioridadOrden: PRIORIDAD_ORDEN[motivo.prioridad],
    ultimoMensajeTexto: texto,
    ultimoMensajeEn: serverTimestamp(),
    ultimoMensajeAutor: autor,
    creadaEn: serverTimestamp(),
    cerradaEn: null,
  });
  const mensajeRef = doc(collection(db, COLECCION, clienteId, "mensajes"));
  batch.set(mensajeRef, {
    autor,
    autorUid: uid,
    texto,
    motivo: motivo.texto,
    creditoContratoId,
    adjuntoStoragePath,
    creadaEn: serverTimestamp(),
  });
  await batch.commit();
}

/**
 * Continúa un hilo ya existente -- crea el mensaje + actualiza el "último mensaje", igual que
 * `enviarMensaje` del lado asesor. La diferencia real: si {@code estadoActual} es `CERRADA`, el update
 * también incluye `estado: 'ABIERTA'` -- eso es justo lo que `reabreSiEstabaCerrada()` (firestore.rules)
 * permite. Si ya estaba `ABIERTA`/`EN_ATENCION`, `estado` NUNCA viaja en el update: agregarla igual sería
 * inofensivo cuando el valor no cambia (`diff().affectedKeys()` no la contaría), pero mandarla también
 * cuando está `EN_ATENCION` la pisaría a `ABIERTA` y desasignaría al asesor -- por eso la condición es
 * explícita, no "siempre mandar estado: ABIERTA".
 */
async function continuarConversacion(params: {
  clienteId: string;
  texto: string;
  estadoActual: EstadoConversacion;
  creditoContratoId: string | null;
  adjuntoStoragePath: string | null;
}): Promise<void> {
  const { clienteId, texto, estadoActual, creditoContratoId, adjuntoStoragePath } = params;
  const uid = uidActualORequerido();
  const autor: AutorMensaje = "CLIENTE";

  const batch = writeBatch(db);
  const mensajeRef = doc(collection(db, COLECCION, clienteId, "mensajes"));
  batch.set(mensajeRef, {
    autor,
    autorUid: uid,
    texto,
    motivo: null,
    creditoContratoId,
    adjuntoStoragePath,
    creadaEn: serverTimestamp(),
  });

  const actualizacionConversacion: Record<string, unknown> = {
    ultimoMensajeTexto: texto,
    ultimoMensajeEn: serverTimestamp(),
    ultimoMensajeAutor: autor,
  };
  if (estadoActual === "CERRADA") {
    actualizacionConversacion.estado = "ABIERTA" satisfies EstadoConversacion;
  }
  batch.update(doc(db, COLECCION, clienteId), actualizacionConversacion);

  await batch.commit();
}
