# Portal Cliente — Motoya

Portal web del cliente final (financiera de motocicletas, crédito directo) — Next.js, export estático a
Firebase Hosting (`clientes-moto-ya.web.app`).

**Diseño de referencia — "Mi Crédito"** (mockup interactivo, mobile + web, actualizado 2026-08-25):
https://claude.ai/code/artifact/e66d52cc-de0e-4904-b222-9b8ad68e8583

**Documentación del proyecto** (raíz del monorepo `motoyav2`):
- `portal-cliente-spec.md` — visión y arquitectura del portal completo.
- `portal-cliente-dev-plan.md` — fases de desarrollo y su estado real.
- `portal-cliente-qa-plan.md` — plan de pruebas (dominio, integración, E2E).
- `motoya-bc09-fase3-documento-interno-portal-y-canales.md` — diseño de "Mi Crédito" (pagos parciales,
  boleta/constancia, vouchers desde el portal).
- `motoya-portal-cliente-pwa-y-testing.md` — camino de PWA y elección de herramientas de testing.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
