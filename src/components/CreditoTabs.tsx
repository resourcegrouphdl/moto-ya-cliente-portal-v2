"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard/credito", label: "Resumen" },
  { href: "/dashboard/credito/moto", label: "Mi moto" },
  { href: "/dashboard/credito/contrato", label: "Mi contrato" },
  { href: "/dashboard/credito/solicitudes", label: "Solicitudes" },
];

/** Nav de las 4 vistas de un crédito -- `contratoId` viaja siempre por query param, mismo criterio que `/dashboard/credito`. */
export function CreditoTabs({ contratoId }: { contratoId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-ink-800">
      {TABS.map((tab) => {
        const activo = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={`${tab.href}?contratoId=${contratoId}`}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${
              activo ? "border-brand-500 text-ink-50" : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
