"use client";

import { useState, useEffect } from "react";
import { Search, Home, Users, Building, FileText, Receipt, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog } from "@/components/ui/dialog";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ rooms: any[]; tenants: any[]; properties: any[]; contracts: any[]; invoices: any[] }>({
    rooms: [], tenants: [], properties: [], contracts: [], invoices: []
  });
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query) {
      setResults({ rooms: [], tenants: [], properties: [], contracts: [], invoices: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const onSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <div
        className="relative group hidden md:flex items-center justify-between w-64 h-10 px-3 py-2 text-sm text-slate-500 bg-white/50 hover:bg-white border border-slate-200/60 shadow-sm hover:shadow-md rounded-full cursor-text transition-all duration-300 backdrop-blur-md"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="font-medium">Tìm kiếm nhanh...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 h-5 font-sans text-[10px] font-medium text-slate-400 bg-slate-100/80 rounded border border-slate-200 pointer-events-none select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      <button
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200"
        onClick={() => setOpen(true)}
      >
        <Search className="w-5 h-5 text-slate-600" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-slate-900/40 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={() => setOpen(false)}
          />
          <Command
            className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            shouldFilter={false} // API handles filtering
          >
            <div className="flex items-center px-4 border-b border-slate-200/60">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <Command.Input
                autoFocus
                placeholder="Tìm phòng, khách, hợp đồng, hóa đơn..."
                value={query}
                onValueChange={setQuery}
                className="flex-1 h-14 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 px-3 text-base"
              />
              {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin mr-2" />}
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 h-6 font-sans text-[10px] font-medium text-slate-400 bg-slate-100 rounded border border-slate-200 pointer-events-none select-none">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {!query && (
                <div className="p-12 text-center text-sm text-slate-400">
                  Nhập từ khóa để bắt đầu tìm kiếm
                </div>
              )}
              {query && !loading &&
                results.rooms.length === 0 &&
                results.tenants.length === 0 &&
                results.properties.length === 0 &&
                results.contracts.length === 0 &&
                results.invoices.length === 0 && (
                <div className="p-12 text-center text-sm text-slate-500">
                  Không tìm thấy kết quả nào cho "{query}"
                </div>
              )}

              {results.invoices?.length > 0 && (
                <Command.Group heading="Hóa đơn" className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {results.invoices.map((inv) => (
                    <Command.Item
                      key={inv.id}
                      value={`invoice-${inv.id}`}
                      onSelect={() => onSelect(`/invoices`)}
                      className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 aria-selected:text-slate-900 group data-[selected=true]:bg-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">
                          {inv.invoiceCode || `Hóa đơn T${inv.month}/${inv.year}`} - Phòng {inv.contract.room.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center justify-between">
                          <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(inv.totalAmount)}</span>
                          <span className={inv.status === 'UNPAID' ? 'text-amber-600 font-medium' : inv.status === 'OVERDUE' ? 'text-rose-600 font-medium' : 'text-emerald-600'}>
                            {inv.status === 'UNPAID' ? 'Chưa thanh toán' : inv.status === 'OVERDUE' ? 'Quá hạn' : 'Đã thanh toán'}
                          </span>
                        </div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.contracts?.length > 0 && (
                <Command.Group heading="Hợp đồng" className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {results.contracts.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`contract-${c.id}`}
                      onSelect={() => onSelect(`/contracts`)}
                      className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 aria-selected:text-slate-900 group data-[selected=true]:bg-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">Hợp đồng: {c.tenant.fullName}</div>
                        <div className="text-xs text-slate-500">Phòng {c.room.name} • {c.isActive ? 'Đang hiệu lực' : 'Đã thanh lý'}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.rooms?.length > 0 && (
                <Command.Group heading="Phòng trọ" className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {results.rooms.map((room) => (
                    <Command.Item
                      key={room.id}
                      value={`room-${room.id}`}
                      onSelect={() => onSelect(`/rooms`)}
                      className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 aria-selected:text-slate-900 group data-[selected=true]:bg-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{room.name}</div>
                        <div className="text-xs text-slate-500">Trạng thái: {room.status === 'AVAILABLE' ? 'Trống' : room.status === 'RENTED' ? 'Đã thuê' : 'Bảo trì'}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.tenants?.length > 0 && (
                <Command.Group heading="Khách thuê" className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {results.tenants.map((tenant) => (
                    <Command.Item
                      key={tenant.id}
                      value={`tenant-${tenant.id}`}
                      onSelect={() => onSelect(`/tenants`)}
                      className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 aria-selected:text-slate-900 group data-[selected=true]:bg-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{tenant.fullName}</div>
                        <div className="text-xs text-slate-500">{tenant.phone}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.properties?.length > 0 && (
                <Command.Group heading="Khu trọ" className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {results.properties.map((prop) => (
                    <Command.Item
                      key={prop.id}
                      value={`prop-${prop.id}`}
                      onSelect={() => onSelect(`/properties`)}
                      className="flex items-center gap-3 px-3 py-2 mt-1 rounded-xl cursor-pointer hover:bg-slate-100 aria-selected:bg-slate-100 aria-selected:text-slate-900 group data-[selected=true]:bg-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{prop.name}</div>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </div>
      )}
    </>
  );
}
