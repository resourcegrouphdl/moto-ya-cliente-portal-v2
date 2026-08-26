/**
 * Espejo, del lado del cliente, de `EstadoPagoCuota` (motoya-api, `cobranza.domain.model`) — mismos 4
 * valores, sin agregar ninguno nuevo acá. Si el backend agrega un estado, este archivo debe fallar la
 * build hasta que se actualice a propósito (unión cerrada, no `string`).
 */
export type EstadoPagoCuota = "PENDIENTE" | "VENCIDA" | "PARCIAL" | "PAGADA";

/**
 * Espejos de los DTOs reales de `portalcliente.infrastructure.adapter.in.web.dto` (motoya-api) --
 * BigDecimal -> number, LocalDate/OffsetDateTime -> string (ISO, sin parsear acá; cada componente decide
 * si necesita Date), UUID -> string. Nunca se agregan campos que el backend no tiene -- si hace falta
 * uno nuevo, se agrega ahí primero.
 */

export interface CreditoResumen {
  solicitudId: string;
  codigoSolicitud: string;
  estadoSolicitud: string;
  expedienteId: string | null;
  estadoExpediente: string | null;
  contratoId: string | null;
  numeroContrato: string | null;
  estadoFormalizacion: string | null;
  estadoCredito: string | null;
  precioVehiculo: number | null;
  creadoEn: string;
}

export interface CreditoDetalle {
  contratoId: string;
  numeroContrato: string;
  estadoFormalizacion: string;
  estadoCredito: string | null;
  precioVehiculo: number;
  inicialEsperada: number;
  fechaFirma: string | null;
  documentoDisponible: boolean;
}

export interface CuotaCliente {
  numeroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  estadoPago: EstadoPagoCuota;
  diasMora: number;
  fechaPago: string | null;
  montoPagado: number | null;
  montoMora: number;
}

export interface CuotaEnMora {
  numeroCuota: number;
  fechaVencimiento: string;
  diasMora: number;
  montoMora: number;
}

export interface EstadoMora {
  tieneCasoAbierto: boolean;
  tieneSolicitudPendiente: boolean;
  cuotasEnMora: CuotaEnMora[];
}

export interface MiMoto {
  marca: string | null;
  modelo: string | null;
  anio: number | null;
  color: string | null;
  numeroChasis: string | null;
  numeroMotor: string | null;
  url: string;
}

export interface MiContrato {
  numeroContrato: string;
  documentoUrl: string | null;
  estadoFormalizacion: string;
}

export type EstadoSolicitudAprobacion = "PENDIENTE_APROBACION" | "APROBADA" | "RECHAZADA";

export interface SolicitudCobranzaCliente {
  id: string;
  estado: EstadoSolicitudAprobacion;
  creadaEn: string;
}

export type OrigenVoucher = "WEBHOOK_WHATSAPP" | "CARGA_MANUAL" | "CARGA_TIENDA" | "MIGRACION_LEGACY" | "CONCILIACION_MANUAL" | "PORTAL_CLIENTE";
export type EstadoVoucher = "PENDIENTE_VERIFICACION" | "VERIFICADO" | "RECHAZADO";

export interface VoucherPago {
  id: string;
  monto: number;
  fechaOperacion: string;
  numeroOperacion: string | null;
  entidadOrigen: string | null;
  origen: OrigenVoucher;
  estado: EstadoVoucher;
  motivoRechazo: string | null;
  evidenciaPendiente: boolean;
  verificadoEn: string | null;
  numerosCuota: number[];
  tieneArchivo: boolean;
  tieneConstancia: boolean;
}

export interface SolicitudSubidaVoucher {
  uploadUrl: string;
  storagePath: string;
  headerRequeridoNombre: string;
  headerRequeridoValor: string;
  cuotaSugerida: number | null;
}

export interface DatosVoucherExtraidos {
  entidadBancaria: string | null;
  numeroOperacion: string | null;
  fechaOperacion: string | null;
  monto: number | null;
  posibleProblemaCalidad: boolean;
  mensajeCalidad: string | null;
  datosOcrCrudo: string | null;
}

/** Espejo de `CuentaPortalCliente` (originacion.domain.model) -- `GET /client/cuenta`. */
export interface CuentaPortalCliente {
  clienteId: string;
  activadoEn: string | null;
  primerLoginCompletadoEn: string | null;
}
