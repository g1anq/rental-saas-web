"use client";

import { useState, useSyncExternalStore } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Home, Users, FileText, ReceiptText, LogOut, Settings, Menu, BarChart3, Wrench, Bell, Building, UserPlus, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/auth-fetch";

type NavItem = { name: string; href: string; icon: LucideIcon };

const landlordNavItems: NavItem[] = [
  { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
  { name: "Khu trọ", href: "/properties", icon: Building },
  { name: "Phòng trọ", href: "/rooms", icon: Home },
  { name: "Khách thuê", href: "/tenants", icon: Users },
  { name: "Hợp đồng", href: "/contracts", icon: FileText },
  { name: "Hóa đơn", href: "/invoices", icon: ReceiptText },
  { name: "Thông báo", href: "/notices", icon: Bell },
  { name: "Bảo trì", href: "/maintenance", icon: Wrench },
  { name: "Yêu cầu từ khách", href: "/roommate-requests", icon: UserPlus },
  { name: "Sổ quỹ", href: "/transactions", icon: Wallet },
  { name: "Báo cáo", href: "/reports", icon: BarChart3 },
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

const tenantNavItems: NavItem[] = [
  { name: "Tổng quan", href: "/portal", icon: Home },
  { name: "Hợp đồng", href: "/portal/contracts", icon: FileText },
  { name: "Sửa chữa", href: "/portal/maintenance", icon: Wrench },
  { name: "Ghi điện nước", href: "/portal/utilities", icon: BarChart3 },
  { name: "Cá nhân", href: "/portal/profile", icon: Users },
];

function getUserRoleSnapshot() {
  const user = JSON.parse(localStorage.getItem("rental_user") || "{}");
  return user.role || "landlord";
}

function subscribeToUserRole() {
  return () => {};
}

function SidebarNavLinks({
  navItems,
  pathname,
  onClick,
  onLogout,
}: {
  navItems: NavItem[];
  pathname: string;
  onClick?: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="p-6 pb-2 flex flex-col items-center text-center">
        <div className="relative w-20 h-20 overflow-hidden rounded-2xl shadow-xl ring-2 ring-white/50 mb-4 transition-transform hover:scale-105 duration-300">
          <Image src="/logo.png" alt="Rental SaaS Logo" fill sizes="80px" className="object-cover" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClick}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out",
                isActive
                  ? "bg-white text-primary shadow-[0_2px_10px_-3px_rgba(6,81,237,0.3)] font-semibold"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900 hover:shadow-sm",
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary" : "text-slate-400 group-hover:text-primary")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const role = useSyncExternalStore(
    subscribeToUserRole,
    getUserRoleSnapshot,
    () => null,
  );

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  if (!role) return null; // Prevent hydration flash

  const navItems = role === 'tenant' ? tenantNavItems : landlordNavItems;

  const handleLogout = async () => {
    try {
      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Không thể đăng xuất. Vui lòng thử lại.");

      localStorage.removeItem("rental_user");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể đăng xuất");
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col h-screen w-64 border-r border-white/40 bg-white/40 backdrop-blur-xl shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] sticky top-0 z-50">
        <SidebarNavLinks
          navItems={navItems}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden flex items-center justify-between gap-3 p-3 border border-white/60 bg-white/90 backdrop-blur-xl shadow-sm fixed top-2 left-3 z-50 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 overflow-hidden rounded-xl shadow-md ring-1 ring-white/50">
            <Image src="/logo.png" alt="Logo" fill sizes="32px" className="object-cover" />
          </div>
          <h2 className="text-base font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
            Rental SaaS
          </h2>
        </div>
        {role === "tenant" ? (
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-5 w-5" />
          </button>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col w-72">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Điều hướng hệ thống</SheetDescription>
              <SidebarNavLinks
                navItems={navItems}
                pathname={pathname}
                onClick={() => setOpen(false)}
                onLogout={handleLogout}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {role === "tenant" && (
        <nav
          aria-label="Điều hướng khách thuê"
          className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 px-1 pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-around">
            {tenantNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="max-w-full truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
