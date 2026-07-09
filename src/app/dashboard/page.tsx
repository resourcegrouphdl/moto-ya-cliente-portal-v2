const SECTIONS = [
  {
    title: "Mi crédito",
    description: "Estado del contrato, cronograma de cuotas y próximo pago.",
  },
  {
    title: "Mis pagos",
    description: "Historial de pagos y comprobantes.",
  },
  {
    title: "Mi moto",
    description: "Datos del vehículo financiado, documentos y seguro.",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-ink-50">Panel de cliente</h1>
      <p className="mt-1 text-sm text-ink-400">
        Sesión iniciada correctamente. Estas secciones se conectarán a motoya-api cuando sus
        endpoints estén disponibles.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
            <h2 className="text-sm font-medium text-ink-50">{section.title}</h2>
            <p className="mt-2 text-xs text-ink-400">{section.description}</p>
            <p className="mt-4 text-xs text-ink-500">Sin datos aún — pendiente de conexión con motoya-api.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
