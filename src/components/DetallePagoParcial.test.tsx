import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetallePagoParcial } from "./DetallePagoParcial";

// UT-02 (portal-cliente-qa-plan.md §9) -- nunca solo un porcentaje, siempre el monto pagado y el
// faltante explícitos. Caso real de motoyav2-politica-pagos-parciales.md: cuota S/150, pagó S/60.
describe("DetallePagoParcial", () => {
  it("muestra pagado, total y faltante explícitos, nunca un porcentaje", () => {
    render(<DetallePagoParcial montoCuota={150} montoPagado={60} />);

    expect(screen.getByText(/S\/ 60\.00 de S\/ 150\.00 pagado/)).toBeInTheDocument();
    expect(screen.getByText(/te faltan S\/ 90\.00/)).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("calcula el faltante -- no lo recibe como prop, para que nunca se desincronice del monto pagado real", () => {
    render(<DetallePagoParcial montoCuota={400} montoPagado={133.5} />);
    expect(screen.getByText(/te faltan S\/ 266\.50/)).toBeInTheDocument();
  });
});
