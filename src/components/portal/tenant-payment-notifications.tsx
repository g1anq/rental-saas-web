"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveBrowserApiUrl } from "@/lib/auth-fetch";

type InvoicePaidNotification = {
  invoiceId: string;
  invoiceCode: string | null;
  month: number;
  year: number;
  amount: number;
  roomName: string;
};

export function TenantPaymentNotifications() {
  const router = useRouter();

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    const socketUrl = new URL(resolveBrowserApiUrl(apiUrl));
    const socket = io(socketUrl.origin, {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
    });

    let hasConnected = false;
    socket.on("connect", () => {
      if (hasConnected) router.refresh();
      hasConnected = true;
    });

    socket.on("invoice:paid", (notification: InvoicePaidNotification) => {
      const amount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(notification.amount);

      toast.success("Thanh toán thành công", {
        description: `Hóa đơn tháng ${notification.month}/${notification.year} • ${notification.roomName} • ${amount}`,
        duration: 8000,
      });
      router.refresh();
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  return null;
}
