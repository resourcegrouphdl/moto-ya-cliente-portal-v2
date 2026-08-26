import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EstadoCuotaBadge } from "./EstadoCuotaBadge";

// UT-01 (portal-cliente-qa-plan.md §9) -- el mismo texto/color que ya usa el mockup de "Mi Crédito"
// (https://claude.ai/code/artifact/e66d52cc-de0e-4904-b222-9b8ad68e8583), un estado por vez.
describe("EstadoCuotaBadge", () => {
  it("cuota pagada -> 'Pagada'", () => {
    render(<EstadoCuotaBadge estadoPago="PAGADA" />);
    expect(screen.getByText("Pagada")).toBeInTheDocument();
  });

  it("cuota pendiente (al día) -> 'Al día'", () => {
    render(<EstadoCuotaBadge estadoPago="PENDIENTE" />);
    expect(screen.getByText("Al día")).toBeInTheDocument();
  });

  it("cuota parcial -> 'Pago parcial'", () => {
    render(<EstadoCuotaBadge estadoPago="PARCIAL" />);
    expect(screen.getByText("Pago parcial")).toBeInTheDocument();
  });

  it("cuota vencida -> 'Vencida'", () => {
    render(<EstadoCuotaBadge estadoPago="VENCIDA" />);
    expect(screen.getByText("Vencida")).toBeInTheDocument();
  });

  it("cada estado tiene su propio color -- nunca 2 estados distintos con el mismo texto en color", () => {
    const { container: pagada } = render(<EstadoCuotaBadge estadoPago="PAGADA" />);
    const { container: vencida } = render(<EstadoCuotaBadge estadoPago="VENCIDA" />);
    const colorPagada = pagada.querySelector("span")?.style.color;
    const colorVencida = vencida.querySelector("span")?.style.color;
    expect(colorPagada).toBeTruthy();
    expect(colorPagada).not.toBe(colorVencida);
  });
});
