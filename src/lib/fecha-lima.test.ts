import { describe, expect, it } from "vitest";
import { hoyLima } from "./fecha-lima";

describe("hoyLima", () => {
  it("es la fecha de Lima, no la de UTC, entre las 7 pm y la medianoche", () => {
    // 2026-12-31 23:30 en Lima (UTC-5) = 2027-01-01 04:30 UTC.
    const instante = new Date("2027-01-01T04:30:00Z");
    expect(instante.toISOString().slice(0, 10)).toBe("2027-01-01");
    expect(hoyLima(instante)).toBe("2026-12-31");
  });

  it("a media mañana coincide con el día de UTC", () => {
    expect(hoyLima(new Date("2026-10-01T15:00:00Z"))).toBe("2026-10-01");
  });
});
