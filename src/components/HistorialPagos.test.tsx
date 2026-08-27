import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistorialPagos } from "./HistorialPagos";
import type { VoucherPago } from "@/lib/types";

function voucher(overrides: Partial<VoucherPago>): VoucherPago {
  return {
    id: "v1",
    monto: 150,
    fechaOperacion: "2026-08-20",
    numeroOperacion: "OP-1",
    entidadOrigen: "BCP",
    origen: "PORTAL_CLIENTE",
    estado: "VERIFICADO",
    motivoRechazo: null,
    evidenciaPendiente: false,
    verificadoEn: "2026-08-21T10:00:00Z",
    numerosCuota: [3],
    tieneArchivo: true,
    tieneConstancia: true,
    ...overrides,
  };
}

describe("HistorialPagos", () => {
  it("sin vouchers, muestra un mensaje en vez de una lista vacía", () => {
    render(<HistorialPagos vouchers={[]} onVerArchivo={vi.fn()} />);
    expect(screen.getByText(/todavía no has subido/i)).toBeInTheDocument();
  });

  it("un voucher rechazado muestra el motivo", () => {
    render(<HistorialPagos vouchers={[voucher({ estado: "RECHAZADO", motivoRechazo: "el monto no coincide" })]} onVerArchivo={vi.fn()} />);

    expect(screen.getByText("Rechazado")).toBeInTheDocument();
    expect(screen.getByText("el monto no coincide")).toBeInTheDocument();
  });

  it("click en 'Ver comprobante' pide la URL firmada y abre una pestaña nueva", async () => {
    const onVerArchivo = vi.fn().mockResolvedValue("https://storage.googleapis.com/firmado");
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<HistorialPagos vouchers={[voucher({ id: "v-123" })]} onVerArchivo={onVerArchivo} />);
    await userEvent.click(screen.getByText("Ver comprobante"));

    await waitFor(() => expect(onVerArchivo).toHaveBeenCalledWith("v-123", "comprobante"));
    expect(openSpy).toHaveBeenCalledWith("https://storage.googleapis.com/firmado", "_blank", "noopener,noreferrer");
  });

  it("un voucher sin archivo ni constancia no muestra ningún botón de ver", () => {
    render(<HistorialPagos vouchers={[voucher({ tieneArchivo: false, tieneConstancia: false })]} onVerArchivo={vi.fn()} />);

    expect(screen.queryByText(/ver comprobante/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ver constancia/i)).not.toBeInTheDocument();
  });
});
