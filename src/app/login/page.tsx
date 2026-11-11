"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth-fetch";

function LoginForm() {
  const [role, setRole] = useState<"landlord" | "tenant">("landlord");

  // Landlord states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Tenant states
  const [cccd, setCccd] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = role === "landlord" ? "/auth/login" : "/auth/tenant/login";
      const payload =
        role === "landlord"
          ? { email: email.trim().toLowerCase(), password: password.trim() }
          : { cccd: cccd.trim(), phone: phone.trim() };

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      localStorage.setItem("rental_user", JSON.stringify(data.user));

      const callbackUrl = searchParams.get("callbackUrl");
      let targetUrl = role === "landlord" ? "/dashboard" : "/portal";
      if (role === "landlord" && callbackUrl?.startsWith("/")) {
        const callback = new URL(callbackUrl, window.location.origin);
        if (
          callback.origin === window.location.origin &&
          callback.pathname !== "/login" &&
          !callback.pathname.startsWith("/login/")
        ) {
          targetUrl = `${callback.pathname}${callback.search}${callback.hash}`;
        }
      }

      router.replace(targetUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          Rental SaaS
        </Link>
      </div>

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Đăng Nhập</h1>
          <p className="text-slate-500">Truy cập vào hệ thống quản lý</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setRole("landlord")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === "landlord" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Chủ trọ
          </button>
          <button
            type="button"
            onClick={() => setRole("tenant")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              role === "tenant" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Khách thuê
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {role === "landlord" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="chu-tro@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="cccd">Căn cước công dân</Label>
                <Input
                  id="cccd"
                  placeholder="Nhập số CCCD"
                  value={cccd}
                  onChange={(e) => setCccd(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Nhập SĐT đăng ký"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Đăng nhập"}
          </Button>
        </form>

        {role === "landlord" && (
          <div className="text-center text-sm text-slate-500 border-t pt-4">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
