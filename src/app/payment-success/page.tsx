"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Home, Receipt, Calendar, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const amount = searchParams.get("amount");
  const room = searchParams.get("room");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const displayAmount = amount ? formatter.format(Number(amount)) : "đã thanh toán";
  const displayRoom = room || "Phòng của bạn";
  const displayTime = (month && year) ? `Tháng ${month}/${year}` : "Kỳ này";

  useEffect(() => {
    // Kích hoạt hiệu ứng pháo giấy (confetti) hoành tráng
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899']
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden animate-in fade-in zoom-in duration-700">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <CheckCircle className="w-20 h-20 text-emerald-500 relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Thanh toán thành công!</h1>
          <p className="text-slate-500 font-medium">Cảm ơn bạn đã thanh toán đúng hạn.</p>
        </div>

        <div className="w-full bg-slate-50/80 rounded-2xl p-5 border border-slate-100 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 text-sm">
              <Receipt className="w-4 h-4" /> Tổng tiền
            </span>
            <span className="font-bold text-lg text-emerald-600">{displayAmount}</span>
          </div>

          <div className="h-px w-full bg-slate-200 border-dashed border-b border-slate-300" />

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 text-sm">
              <Home className="w-4 h-4" /> Phòng thuê
            </span>
            <span className="font-medium text-slate-700">{displayRoom}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500 text-sm">
              <Calendar className="w-4 h-4" /> Kỳ thanh toán
            </span>
            <span className="font-medium text-slate-700">{displayTime}</span>
          </div>
        </div>

        <div className="flex w-full gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            onClick={() => router.push('/')} // Giả sử tenant cũng xem trang dashboard (hoặc tùy bạn điều hướng)
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <Button
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4 mr-2" /> Tải biên lai
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />

      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
