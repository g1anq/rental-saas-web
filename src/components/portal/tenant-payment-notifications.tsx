"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type InvoicePaidNotification = {
  invoiceId: string;
  invoiceCode: string | null;
  month: number;
  year: number;
  amount: number;
  roomName: string;
};

function getAuthToken() {
  const tokenCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("rental_token="));
  return tokenCookie ? decodeURIComponent(tokenCookie.slice("rental_token=".length)) : null;
}

export function TenantPaymentNotifications() {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!token || !apiUrl) return;

    const socket = io(apiUrl, {
      auth: { token },
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
