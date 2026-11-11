"use client";

import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Wrench, ChevronRight } from "lucide-react";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Notice, MaintenanceRequest } from "@/types";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { GlobalSearch } from "./global-search";

export function TopBar() {
  const [role, setRole] = useState<string | null>(null);

  // Tenant state
  const [notices, setNotices] = useState<Notice[]>([]);
  // Landlord state
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("rental_user") || "{}");
    setRole(user.role || 'landlord');
  }, []);

  const fetchData = async () => {
    if (!role) return;
    setLoading(true);
    try {
      if (role === 'tenant') {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/notices`);
        if (res.ok) setNotices(await res.json());
      } else if (role === 'landlord') {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/maintenance?status=PENDING`);
        if (res.ok) setMaintenance(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  if (!role) return null;

  return (
    <div className="z-50 flex items-center gap-3">
      {role === 'landlord' && <GlobalSearch />}
      {role === 'tenant' ? (
        <TenantBell notices={notices} loading={loading} />
      ) : (
        <LandlordBell maintenance={maintenance} loading={loading} />
      )}
    </div>
  );
}

function TenantBell({ notices, loading }: { notices: Notice[], loading: boolean }) {
  const importantCount = notices.filter(n => n.isImportant).length;

  return (
    <Popover>
      <PopoverTrigger className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 border border-slate-200 outline-none">
        <Bell className="h-5 w-5 text-slate-600" />
        {notices.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white border-2 border-white">
            {notices.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl shadow-lg border-slate-100">
        <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Thông báo từ Chủ trọ</h3>
          {importantCount > 0 && (
            <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {importantCount} khẩn
            </span>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : notices.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Chưa có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notices.map((notice) => (
                <div key={notice.id} className={`p-4 transition-colors hover:bg-slate-50 ${notice.isImportant ? 'bg-rose-50/30' : ''}`}>
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm font-medium leading-tight ${notice.isImportant ? 'text-rose-700' : 'text-slate-800'}`}>
                      {notice.title}
                    </h4>
                    {notice.isImportant && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{format(new Date(notice.createdAt), "dd/MM/yyyy HH:mm")}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LandlordBell({ maintenance, loading }: { maintenance: MaintenanceRequest[], loading: boolean }) {
  const urgentCount = maintenance.filter(m => m.priority === 'URGENT' || m.priority === 'HIGH').length;

  return (
    <Popover>
      <PopoverTrigger className="relative h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-50 border border-slate-200 outline-none">
        <Bell className="h-5 w-5 text-slate-600" />
        {maintenance.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white border-2 border-white">
            {maintenance.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 overflow-hidden rounded-xl shadow-lg border-slate-100">
        <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Yêu cầu mới</h3>
          {urgentCount > 0 && (
            <span className="text-xs font-medium text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {urgentCount} khẩn
            </span>
          )}
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">Đang tải...</div>
          ) : maintenance.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Không có yêu cầu bảo trì nào đang chờ xử lý.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {maintenance.map((req) => (
                <div key={req.id} className="p-4 transition-colors hover:bg-slate-50 group">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="text-sm font-medium leading-tight text-slate-800">
                      {req.title}
                    </h4>
                    {(req.priority === 'URGENT' || req.priority === 'HIGH') && (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                      Phòng {req.room?.name}
                    </span>
                    <span>{format(new Date(req.createdAt), "dd/MM HH:mm")}</span>
                  </div>
                  <Link href={req.title.startsWith("Yêu cầu") ? "/roommate-requests" : "/maintenance"} className="text-sm text-blue-600 font-medium inline-flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem chi tiết <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-slate-50 border-t p-2">
          <Link href="/maintenance" className="block text-center text-sm text-slate-600 hover:text-slate-900 py-1">
            Xem tất cả yêu cầu
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
