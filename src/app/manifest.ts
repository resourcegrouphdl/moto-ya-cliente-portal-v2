import type { MetadataRoute } from "next";

// PWA (2026-08-25, ver motoya-portal-cliente-pwa-y-testing.md) — Next.js resuelve esta convención en
// build time (compatible con `output: "export"`, no depende de ningún servidor en producción). Los
// íconos salen de `favicon.png` (marca ya usada como favicon del proyecto), no de la marca/wordmark
// horizontal — un ícono cuadrado se ve mejor en el launcher del sistema operativo.
//
// `force-static` explícito: con `output: "export"` Next exige declarar esto en cada route de metadata
// dinámica (manifest/sitemap/robots) aunque no tenga nada dinámico -- sin esto el build falla con
// "dynamic not configured" (confirmado corriendo `next build` real, no es una suposición).
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Moto Ya Digital",
    short_name: "Moto Ya",
    description: "Revisa tu crédito, tus cuotas y sube tus comprobantes de pago.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#10151d",
    theme_color: "#10151d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
