"use client";

import { useState } from "react";
import Image from "next/image";
import { Tenant } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Phone, CreditCard, Mail, Home, BadgeCheck, MapPin, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TenantDetailsDialog({ tenant }: { tenant: Tenant }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors outline-none">
        Chi tiết
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh] w-full">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <User className="w-6 h-6 text-indigo-600" />
            Hồ sơ Khách thuê
          </DialogTitle>
          <DialogDescription>
            Xem thông tin chi tiết và danh sách phòng đang thuê của khách này.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Thông tin cá nhân */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              Thông tin cá nhân
            </h4>
            <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                <strong className="font-bold text-slate-800 text-lg">{tenant.fullName}</strong>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Căn cước công dân</span>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    {tenant.cccd}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Số điện thoại</span>
                  <div className="flex items-center gap-2 font-medium text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {tenant.phone}
                  </div>
                </div>
                {tenant.email && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Email liên hệ</span>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {tenant.email}
                    </div>
                  </div>
                )}
                {tenant.dob && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Ngày sinh</span>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(tenant.dob).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                )}
                {tenant.gender && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Giới tính</span>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      {tenant.gender}
                    </div>
                  </div>
                )}
                {tenant.address && (
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Địa chỉ thường trú</span>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {tenant.address}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ảnh CCCD */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" /> Ảnh chụp giấy tờ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] text-center">
                {tenant.idCardFront ? (
                  <Image src={tenant.idCardFront} alt="CCCD Mặt Trước" width={360} height={160} unoptimized className="max-h-40 w-auto object-contain rounded" />
                ) : (
                  <div className="text-slate-400 text-sm">Chưa có ảnh CCCD mặt trước</div>
                )}
              </div>
              <div className="border rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center min-h-[160px] text-center">
                {tenant.idCardBack ? (
                  <Image src={tenant.idCardBack} alt="CCCD Mặt Sau" width={360} height={160} unoptimized className="max-h-40 w-auto object-contain rounded" />
                ) : (
                  <div className="text-slate-400 text-sm">Chưa có ảnh CCCD mặt sau</div>
                )}
              </div>
            </div>
          </div>

          {/* Phân loại & Danh sách phòng */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-500" /> Phòng đang thuê / Ở ghép
            </h4>

            {tenant.roommateOfContract ? (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {tenant.roommateOfContract.room?.name || "Không rõ tên phòng"}
                    </p>
                    <p className="text-xs text-orange-600/80 font-medium">
                      Vai trò: Người ở ghép
                    </p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
                  Thành viên
                </Badge>
              </div>
            ) : tenant.contracts && tenant.contracts.length > 0 ? (
              <div className="grid gap-3">
                {tenant.contracts.map((contract) => (
                  <div key={contract.id} className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Home className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {contract.room?.name || "Không rõ tên phòng"}
                        </p>
                        <p className="text-xs text-indigo-600/80 font-medium">
                          Vai trò: Đứng tên hợp đồng
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">
                      Đang hiệu lực
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 p-6 rounded-xl border text-center text-slate-500 text-sm italic">
                Khách này hiện tại chưa thuê phòng nào.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
