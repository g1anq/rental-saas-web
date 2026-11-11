"use client";

import { useState } from "react";
import Image from "next/image";
import { Invoice } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Copy, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function TenantInvoiceDetailsDialog({
  invoice,
  triggerLabel = "Quét mã QR thanh toán"
}: {
  invoice: Invoice;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const landlord = invoice.contract?.room?.landlord;
  const bankName = landlord?.bankName || "MB";
  const bankAccount = landlord?.bankAccount || "0988889999";
  const bankAccountName = landlord?.bankAccountName || landlord?.name || "CHỦ TRỌ";
  const invoiceCode = invoice.invoiceCode || `HD${invoice.month}${invoice.year}`;
  const addInfo = `RT ${invoiceCode}`;

  const qrUrl =
    invoice.paymentLink ||
    (bankAccount
      ? `https://img.vietqr.io/image/${bankName}-${bankAccount}-compact2.png?amount=${invoice.totalAmount}&addInfo=${encodeURIComponent(
        addInfo
      )}&accountName=${encodeURIComponent(bankAccountName)}`
      : null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`Đã sao chép ${label}`);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-10 px-4 py-2 w-full bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]">
        <QrCode className="w-4 h-4" />
        <span>{triggerLabel}</span>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto p-4 sm:max-h-[92vh] sm:max-w-[540px] sm:p-6">
        <DialogHeader>
          <div className="flex flex-col items-start justify-between gap-2 min-[380px]:flex-row min-[380px]:items-center">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold sm:text-xl">
              <span>Hóa đơn Tháng {invoice.month}/{invoice.year}</span>
            </DialogTitle>
            <Badge
              variant={invoice.status === "PAID" ? "default" : invoice.status === "UNPAID" ? "outline" : "destructive"}
              className={
                invoice.status === "PAID"
                  ? "bg-emerald-100 text-emerald-700 border-none px-2.5 py-0.5 text-xs font-semibold"
                  : invoice.status === "UNPAID"
                    ? "bg-amber-100 text-amber-700 border-none px-2.5 py-0.5 text-xs font-semibold"
                    : "bg-rose-100 text-rose-700 border-none px-2.5 py-0.5 text-xs font-semibold"
              }
            >
              {invoice.status === "PAID" ? "Đã thanh toán" : invoice.status === "UNPAID" ? "Chưa thanh toán" : "Quá hạn"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* QR Payment Section (Hiển thị đầu tiên và nổi bật khi chưa thanh toán) */}
          {invoice.status !== "PAID" && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border-2 border-indigo-200/80 bg-gradient-to-b from-indigo-50/90 via-blue-50/50 to-white p-3 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-base">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <QrCode className="w-5 h-5" />
                </div>
                <span>Mã VietQR Thanh Toán Nhanh</span>
              </div>

              {qrUrl ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                    <Image
                      src={qrUrl}
                      alt="VietQR Thanh Toán"
                      width={224}
                      height={224}
                      unoptimized
                      className="h-48 w-48 rounded-lg object-contain sm:h-56 sm:w-56"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hỗ trợ tất cả ứng dụng Ngân hàng & Ví MoMo, VNPay</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                  Chủ trọ chưa cập nhật tài khoản ngân hàng. Vui lòng liên hệ chủ trọ để thanh toán.
                </div>
              )}

              {/* Thông tin chuyển khoản chi tiết kèm nút sao chép nhanh */}
              <div className="w-full bg-white rounded-xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Ngân hàng</span>
                  <span className="font-bold text-slate-800">{bankName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Số tài khoản</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">{bankAccount}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankAccount, "số tài khoản")}
                      className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === "số tài khoản" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Chủ tài khoản</span>
                  <span className="font-bold text-slate-800 uppercase">{bankAccountName}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Số tiền</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-rose-600 text-sm">{formatter.format(invoice.totalAmount)}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(String(invoice.totalAmount), "số tiền")}
                      className="p-1 rounded hover:bg-slate-100 text-indigo-600 transition-colors"
                      title="Sao chép số tiền"
                    >
                      {copiedField === "số tiền" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-amber-50/80 -mx-1.5 p-2 rounded-lg border border-amber-200/80">
                  <div className="flex flex-col">
                    <span className="text-amber-800 font-semibold">Nội dung chuyển khoản</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm mt-0.5">{addInfo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(addInfo, "nội dung chuyển khoản")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-md border border-amber-300 text-amber-800 font-medium hover:bg-amber-100 transition-colors shadow-2xs"
                  >
                    {copiedField === "nội dung chuyển khoản" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500 italic">
                * Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động nhận diện và gạch nợ hóa đơn.
              </p>
            </div>
          )}

          {/* Chi tiết chi phí */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5 text-sm">
            <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Bảng kê chi tiết</h4>
            <div className="flex justify-between text-slate-600">
              <span>Tiền phòng:</span>
              <span className="font-medium text-slate-800">{formatter.format(invoice.rentAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền điện:</span>
              <span className="font-medium text-slate-800">{formatter.format(invoice.electricityAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền nước:</span>
              <span className="font-medium text-slate-800">{formatter.format(invoice.waterAmount)}</span>
            </div>

            {Array.isArray(invoice.customServices) && invoice.customServices.length > 0 && (
              <div className="pt-2 mt-2 border-t border-dashed border-slate-200 space-y-2">
                {invoice.customServices.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600">
                    <span>{service.name}:</span>
                    <span className="font-medium text-slate-800">{formatter.format(service.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {invoice.otherAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Phụ phí khác:</span>
                <span className="font-medium text-slate-800">{formatter.format(invoice.otherAmount)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-base text-slate-900">Tổng thanh toán:</span>
              <span className="font-extrabold text-xl text-rose-600">{formatter.format(invoice.totalAmount)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="text-xs bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200">
              <span className="font-bold">Ghi chú từ chủ trọ:</span> {invoice.notes}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
