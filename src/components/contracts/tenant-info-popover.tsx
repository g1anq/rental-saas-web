"use client";

import { Tenant } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Phone, CreditCard, Mail } from "lucide-react";
import Link from "next/link";

export function TenantInfoPopover({ tenant }: { tenant: Tenant }) {
  if (!tenant) return <span className="text-slate-400 italic">Trống</span>;

  return (
    <Popover>
      <PopoverTrigger className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left outline-none">
        {tenant.fullName}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 shadow-lg rounded-xl border-slate-100">
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
            <User className="w-4 h-4 text-slate-500" />
            Chi tiết Khách thuê
          </h4>
          <div className="text-sm space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span><strong className="font-medium text-slate-700">CCCD:</strong> {tenant.cccd}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span><strong className="font-medium text-slate-700">SĐT:</strong> {tenant.phone}</span>
            </div>
            {tenant.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span><strong className="font-medium text-slate-700">Email:</strong> {tenant.email}</span>
              </div>
            )}
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100">
            <Link href="/tenants" className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center gap-1">
              Quản lý danh sách khách thuê &rarr;
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
