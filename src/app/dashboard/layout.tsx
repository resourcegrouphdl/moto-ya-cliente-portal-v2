"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isResolving, logout } = useAuth();

  useEffect(() => {
    if (!isResolving && !isAuthenticated) router.replace("/login");
  }, [isResolving, isAuthenticated, router]);

  if (isResolving || !isAuthenticated) return null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-ink-800 px-6 py-4">
        <span className="text-sm font-medium text-ink-50">Mi Motoya</span>
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <span>{user?.email}</span>
          <button
            onClick={() => logout()}
            className="rounded-md border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition-colors hover:border-ink-500 hover:text-ink-50"
          >
            Salir
          </button>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
