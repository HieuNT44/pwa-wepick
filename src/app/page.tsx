"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect to home page
    router.push("/home");
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
