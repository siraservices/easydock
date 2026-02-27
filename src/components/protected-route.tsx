"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("boat_owner" | "marina_owner" | "admin")[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
      router.push(profile.role === "marina_owner" ? "/dashboard" : "/search");
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Checking authentication..." />;
  }

  if (!user) {
    return <LoadingSpinner size="lg" message="Redirecting to login..." />;
  }

  if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
    return <LoadingSpinner size="lg" message="Redirecting..." />;
  }

  return <>{children}</>;
}
