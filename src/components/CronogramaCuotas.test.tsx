import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CronogramaCuotas } from "./CronogramaCuotas";
import type { CuotaCliente } from "@/lib/types";

function cuota(overrides: Partial<CuotaCliente>): CuotaCliente {
  return {
    numeroCuota: 1,
    fechaVencimiento: "2026-09-01",
    montoCuota: 150,
    estadoPago: "PENDIENTE",
    diasMora: 0,
    fechaPago: null,
    montoPagado: null,
    montoMora: 0,
    montoRefinanciado: false,
    ...overrides,
  };
}

describe("CronogramaCuotas", () => {
  it("sin cuotas, muestra un mensaje en vez de una lista vacía", () => {
    render(<CronogramaCuotas cuotas={[]} />);
    expect(screen.getByText(/todavía no hay cuotas/i)).toBeInTheDocument();
  });

  it("una cuota PARCIAL muestra el detalle de cuánto pagó y cuánto le falta", () => {
    render(<CronogramaCuotas cuotas={[cuota({ numeroCuota: 2, estadoPago: "PARCIAL", montoCuota: 150, montoPagado: 60 })]} />);

    expect(screen.getByText("Cuota 2")).toBeInTheDocument();
    expect(screen.getByText("Pago parcial")).toBeInTheDocument();
    expect(screen.getByText(/S\/ 60\.00 de S\/ 150\.00 pagado/)).toBeInTheDocument();
  });

  it("una cuota VENCIDA muestra los días y el monto de mora", () => {
    render(<CronogramaCuotas cuotas={[cuota({ estadoPago: "VENCIDA", diasMora: 5, montoMora: 15 })]} />);

    expect(screen.getByText("Vencida")).toBeInTheDocument();
    expect(screen.getByText(/5 días de mora/)).toBeInTheDocument();
  });

  it("una cuota PAGADA no muestra detalle de pago parcial ni de mora", () => {
    render(<CronogramaCuotas cuotas={[cuota({ estadoPago: "PAGADA", montoPagado: 150 })]} />);

    expect(screen.getByText("Pagada")).toBeInTheDocument();
    expect(screen.queryByText(/de mora/)).not.toBeInTheDocument();
    expect(screen.queryByText(/pagado/)).not.toBeInTheDocument();
  });

  it("una cuota con montoRefinanciado muestra la etiqueta 'Refinanciada'", () => {
    render(<CronogramaCuotas cuotas={[cuota({ montoRefinanciado: true })]} />);

    expect(screen.getByText("Refinanciada")).toBeInTheDocument();
  });

  it("una cuota sin montoRefinanciado no muestra la etiqueta", () => {
    render(<CronogramaCuotas cuotas={[cuota({ montoRefinanciado: false })]} />);

    expect(screen.queryByText("Refinanciada")).not.toBeInTheDocument();
  });
});
