import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App 100% client-side (Firebase Auth client SDK, sin API routes ni server
  // actions) — export estático para Firebase Hosting plano, mismo patrón que
  // seccion-aliado-comercial (Angular) en vez de las Cloud Functions/Cloud Run
  // que exige el soporte nativo de frameworks de Firebase para SSR real.
  output: "export",
};

export default nextConfig;
