import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Toaster } from "@/components/ui/sonner";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rental SaaS - Quản lý Nhà Trọ",
  description: "Phần mềm quản lý nhà trọ hiện đại, nhanh chóng",
};

const AUTH_ROUTES = ["/login", "/register", "/payment-success"];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage = pathname === "/" || AUTH_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col md:flex-row bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-cyan-50">
        {!isAuthPage && <Sidebar />}
        <main
          className={
            isAuthPage
              ? "flex-1 min-h-screen"
              : "flex-1 h-dvh flex flex-col"
          }
        >
          {!isAuthPage && (
            <div className="h-16 flex items-center justify-end px-4 md:px-8 shrink-0 border-b border-slate-100 bg-white/70 backdrop-blur-md md:bg-transparent md:border-none sticky top-0 z-40">
              <TopBar />
            </div>
          )}
          <div className={isAuthPage ? "" : "flex-1 overflow-y-auto p-4 pb-28 md:p-8"}>
            {children}
          </div>
        </main>
        <Toaster position="top-right" richColors />
        {!isAuthPage && <AiChatWidget />}
      </body>
    </html>
  );
}
