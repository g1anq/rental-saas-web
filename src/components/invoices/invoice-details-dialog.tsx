"use client";

import { useState } from "react";
import { Invoice } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { useRouter } from "next/navigation";
import { Loader2, QrCode, CheckCircle2, Mail, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export function InvoiceDetailsDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const handleMarkAsPaid = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/mark-paid`, {
        method: "PATCH",
      });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setSendingEmail(true);
    setMessage(null);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/send-reminder`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Đã gửi email nhắc nợ thành công!" });
      } else {
        setMessage({ type: "error", text: data.message || "Không thể gửi email" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi kết nối máy chủ" });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    // html2canvas không hỗ trợ oklch của Tailwind v4, nên dùng window.print() là chuẩn và nét nhất
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hóa Đơn Tháng ${invoice.month}/${invoice.year}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e40af; margin: 0 0 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 16px; }
          .label { color: #666; }
          .val { font-weight: 500; }
          .box { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: bold; }
          .total-val { color: #1e40af; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-top: 10px; }
          .status.PAID { background: #d1fae5; color: #047857; }
          .status.UNPAID { background: #fef3c7; color: #b45309; }
          .status.OVERDUE { background: #fee2e2; color: #b91c1c; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Hóa Đơn Tiền Phòng</h1>
          <div>Tháng ${invoice.month} / Năm ${invoice.year}</div>
          <div class="status ${invoice.status}">
            ${invoice.status === "PAID" ? "ĐÃ THU" : invoice.status === "UNPAID" ? "CHƯA THU" : "QUÁ HẠN"}
          </div>
        </div>

        <div class="row">
          <span class="label">Phòng:</span>
          <span class="val">${invoice.contract?.room?.name}</span>
        </div>
        <div class="row">
          <span class="label">Khách thuê:</span>
          <span class="val">${invoice.contract?.tenant?.fullName}</span>
        </div>

        <div class="box">
          <div class="row">
            <span class="label">Tiền phòng:</span>
            <span class="val">${formatter.format(invoice.rentAmount)}</span>
          </div>
          <div class="row">
            <span class="label">Tiền điện:</span>
            <span class="val">${formatter.format(invoice.electricityAmount)}</span>
          </div>
          <div class="row">
            <span class="label">Tiền nước:</span>
            <span class="val">${formatter.format(invoice.waterAmount)}</span>
          </div>
          ${invoice.customServices ? invoice.customServices.map(s => `
          <div class="row">
            <span class="label">${s.name}:</span>
            <span class="val">${formatter.format(s.amount)}</span>
          </div>
          `).join('') : ''}
          ${invoice.otherAmount > 0 ? `
          <div class="row">
            <span class="label">Phụ phí (khác):</span>
            <span class="val">${formatter.format(invoice.otherAmount)}</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>Tổng cộng:</span>
            <span class="total-val">${formatter.format(invoice.totalAmount)}</span>
          </div>
        </div>

        ${invoice.notes ? `
        <div style="margin-top: 20px; padding: 15px; background: #fffbeb; color: #92400e; border: 1px solid #fde68a; border-radius: 8px;">
          <strong>Ghi chú:</strong> ${invoice.notes}
        </div>
        ` : ''}

        <div style="margin-top: 40px; text-align: center; color: #888; font-size: 14px;">
          Cảm ơn bạn đã thanh toán đúng hạn!
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Đợi CSS load và in
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-primary hover:text-primary/80 font-medium text-sm transition-colors">
        Chi tiết
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <div id={`invoice-pdf-${invoice.id}`} className="bg-white p-4">
          <DialogHeader>
            <DialogTitle className="text-xl">Hóa đơn Tháng {invoice.month}/{invoice.year}</DialogTitle>
          </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phòng</p>
              <p className="font-medium">{invoice.contract?.room?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Khách thuê</p>
              <p className="font-medium">{invoice.contract?.tenant?.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <Badge
                variant={invoice.status === "PAID" ? "default" : invoice.status === "UNPAID" ? "outline" : "destructive"}
                className={
                  invoice.status === "PAID" ? "bg-emerald-100 text-emerald-700 border-none"
                  : invoice.status === "UNPAID" ? "bg-amber-100 text-amber-700 border-none"
                  : "bg-rose-100 text-rose-700 border-none"
                }
              >
                {invoice.status === "PAID" ? "Đã thu" : invoice.status === "UNPAID" ? "Chưa thu" : "Quá hạn"}
              </Badge>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiền phòng</span>
              <span className="font-medium">{formatter.format(invoice.rentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiền điện</span>
              <span className="font-medium">{formatter.format(invoice.electricityAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tiền nước</span>
              <span className="font-medium">{formatter.format(invoice.waterAmount)}</span>
            </div>
            {invoice.customServices && invoice.customServices.map((service, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{service.name}</span>
                <span className="font-medium">{formatter.format(service.amount)}</span>
              </div>
            ))}
            {invoice.otherAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Phụ phí (khác)</span>
                <span className="font-medium">{formatter.format(invoice.otherAmount)}</span>
              </div>
            )}
            <div className="pt-3 border-t flex justify-between">
              <span className="font-semibold text-base">Tổng cộng</span>
              <span className="font-bold text-lg text-primary">{formatter.format(invoice.totalAmount)}</span>
            </div>
          </div>

          {invoice.paymentLink && invoice.status !== "PAID" && (
            <div className="flex flex-col items-center justify-center p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Quét mã QR để thanh toán
              </p>
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-3 relative w-48 h-48">
                <Image src={invoice.paymentLink} alt="VietQR Code" fill className="object-contain p-1" />
              </div>
              <p className="text-xs text-slate-500 text-center max-w-[280px]">
                Hỗ trợ thanh toán qua VietQR. Khách thuê có thể dùng bất kỳ ứng dụng Ngân hàng hoặc MoMo nào để quét.
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(invoice.paymentLink!);
                  toast.success("Đã sao chép link thanh toán");
                }}
                className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Sao chép link gửi khách
              </button>
            </div>
          )}

          {invoice.notes && (
            <div className="text-sm bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200">
              <span className="font-semibold">Ghi chú: </span> {invoice.notes}
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {invoice.status !== "PAID" && (
            <div id={`invoice-actions-${invoice.id}`} className="flex flex-col gap-3">
              <button
                onClick={handleMarkAsPaid}
                disabled={loading || sendingEmail}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                Xác nhận đã thu tiền
              </button>

              <button
                onClick={handleSendReminder}
                disabled={loading || sendingEmail}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {sendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                Gửi email nhắc nợ
              </button>
            </div>
          )}

          <div className="flex justify-center mt-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Tải Hóa Đơn PDF
            </button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
