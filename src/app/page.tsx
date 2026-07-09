"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isResolving } = useAuth();

  useEffect(() => {
    if (isResolving) return;
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [isResolving, isAuthenticated, router]);

  return null;
}
