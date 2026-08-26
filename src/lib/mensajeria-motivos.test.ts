import { describe, expect, it } from "vitest";
import { MOTIVOS_CONVERSACION, PRIORIDAD_ORDEN, motivoPorId } from "./mensajeria-motivos";

describe("mensajeria-motivos", () => {
  it("tiene los 9 motivos del spec §6, sin duplicados de id", () => {
    expect(MOTIVOS_CONVERSACION).toHaveLength(9);
    expect(new Set(MOTIVOS_CONVERSACION.map((m) => m.id)).size).toBe(9);
  });

  it("PRIORIDAD_ORDEN ordena ALTA antes que MEDIA antes que BAJA", () => {
    expect(PRIORIDAD_ORDEN.ALTA).toBeLessThan(PRIORIDAD_ORDEN.MEDIA);
    expect(PRIORIDAD_ORDEN.MEDIA).toBeLessThan(PRIORIDAD_ORDEN.BAJA);
  });

  it("condonación y reprogramación son los únicos motivos que disparan una acción de Cobranza real", () => {
    const conAccionDeCobranza = MOTIVOS_CONVERSACION.filter((m) => m.accion === "condonacion" || m.accion === "reprogramacion");
    expect(conAccionDeCobranza.map((m) => m.id).sort()).toEqual(["condonacion", "reprogramar"]);
  });

  it("motivoPorId devuelve el motivo correcto", () => {
    expect(motivoPorId("condonacion").texto).toBe("Solicito condonación / revisión de mora");
  });

  it("motivoPorId lanza para un id desconocido", () => {
    // @ts-expect-error -- probando el guard en runtime, no el tipo
    expect(() => motivoPorId("no_existe")).toThrow();
  });
});
