"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail } from "@/lib/firebase/auth";
import { useAnalytics } from "@/hooks/use-analytics";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    trackEvent("login_attempt", { email });

    const { user, error } = await loginWithEmail(email, password);

    if (error) {
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      
      if (error instanceof Error) {
        if (error.message.includes("user-not-found")) {
          errorMessage = "Email không tồn tại.";
        } else if (error.message.includes("wrong-password")) {
          errorMessage = "Mật khẩu không đúng.";
        } else if (error.message.includes("invalid-email")) {
          errorMessage = "Email không hợp lệ.";
        } else if (error.message.includes("too-many-requests")) {
          errorMessage = "Quá nhiều lần thử. Vui lòng thử lại sau.";
        }
      }

      toast({
        title: "Lỗi đăng nhập",
        description: errorMessage,
        variant: "destructive",
      });

      trackEvent("login_failed", { email, error: errorMessage });
    } else if (user) {
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn trở lại!",
      });

      trackEvent("login_success", { email });
      router.push("/home");
    }

    setLoading(false);
  };

  return (
    <div className="Login min-h-screen flex flex-col w-full relative overflow-hidden bg-background-light">
      {/* Background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#46BAC1 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
          opacity: 0.05,
        }}
      />

      <main className="flex-1 flex flex-col px-8 pt-20 pb-12 relative z-10">
        {/* Logo section */}
        <div className="flex flex-col items-center mb-12">
          <div className="size-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/30 mb-6 rotate-3">
            <span className="material-symbols-outlined text-white text-5xl !font-light">
              sports_tennis
            </span>
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">
            we<span className="text-primary">pick</span>
          </h1>
          <p className="text-text-muted mt-2 font-medium">Quản lý Pickleball dễ dàng</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              mail
            </span>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 pr-4 rounded-2xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              lock
            </span>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 pr-12 rounded-2xl border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted cursor-pointer hover:text-text-main transition-colors"
            >
              <span className="material-symbols-outlined">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          <div className="flex justify-end px-1">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        {/* Sign up link */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-sm text-text-muted">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="font-bold text-primary ml-1 hover:text-primary/80 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </main>

      {/* Bottom indicator */}
      <div className="h-2 w-32 bg-gray-100 rounded-full mx-auto mb-2 opacity-50" />
    </div>
  );
}

