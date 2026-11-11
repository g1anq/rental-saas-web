import { fetchWithAuth } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle2 } from "lucide-react";
import { Contract, Invoice, Tenant } from "@/types";
import { TenantInvoiceDetailsDialog } from "@/components/invoices/tenant-invoice-details-dialog";
import { redirect } from "next/navigation";

async function getProfile(): Promise<Tenant & { contract?: Contract }> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/me`, { cache: 'no-store' });
  if (!res.ok) redirect("/login");
  return res.json();
}

async function getInvoices(): Promise<Invoice[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/invoices`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TenantPortalPage() {
  const [profile, invoices] = await Promise.all([
    getProfile(),
    getInvoices(),
  ]);

  const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
  const unpaidInvoices = invoices.filter(inv => inv.status !== "PAID");
  const paidInvoices = invoices.filter(inv => inv.status === "PAID");

  return (
    <div className="mx-auto w-full max-w-6xl pb-4 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold leading-tight text-slate-800 sm:text-2xl">
          Tổng quan Phòng {profile.contract?.room?.name || "N/A"}
        </h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Xin chào, {profile.fullName}
        </p>
      </div>

      {/* Unpaid Invoices Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">Hóa đơn cần thanh toán</h2>
          {unpaidInvoices.length > 0 && (
            <Badge variant="destructive" className="ml-2 font-semibold">{unpaidInvoices.length}</Badge>
          )}
        </div>

        {unpaidInvoices.length === 0 ? (
          <Card className="bg-white/60 border-dashed border-emerald-200">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center text-slate-500 sm:py-10">
              <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="font-semibold text-slate-700">Tuyệt vời! Bạn không có hóa đơn nào chưa thanh toán.</p>
              <p className="text-xs text-slate-400 mt-1">Cảm ơn bạn đã luôn hoàn thành tiền phòng đúng hạn.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {unpaidInvoices.map(inv => {
              return (
                <Card key={inv.id} className="border-rose-200 bg-white shadow-md hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600" />
                    <CardHeader className="pb-3">
                      <div className="flex flex-col items-start gap-1.5 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                        <CardTitle className="text-base font-bold text-slate-800 sm:text-lg">
                          Tháng {inv.month}/{inv.year}
                        </CardTitle>
                        <span className="whitespace-nowrap text-lg font-extrabold text-rose-600 sm:text-xl">{formatter.format(inv.totalAmount)}</span>
                      </div>
                      <CardDescription className="flex flex-col items-start gap-2 pt-2 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                        <span>Hạn đóng: 05/{String(inv.month % 12 + 1).padStart(2, '0')}/{inv.month === 12 ? inv.year + 1 : inv.year}</span>
                        <Badge className="bg-rose-100 text-rose-700 border-none font-medium text-xs">
                          {inv.status === "OVERDUE" ? "Quá hạn" : "Chưa thanh toán"}
                        </Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1.5 pb-4">
                      <div className="flex justify-between text-slate-600">
                        <span>Tiền phòng:</span>
                        <span className="font-medium text-slate-800">{formatter.format(inv.rentAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tiền điện:</span>
                        <span className="font-medium text-slate-800">{formatter.format(inv.electricityAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Tiền nước:</span>
                        <span className="font-medium text-slate-800">{formatter.format(inv.waterAmount)}</span>
                      </div>
                      {Array.isArray(inv.customServices) && inv.customServices.length > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Dịch vụ:</span>
                          <span className="font-medium text-slate-800">
                            {formatter.format(inv.customServices.reduce((sum, s) => sum + Number(s.amount), 0))}
                          </span>
                        </div>
                      )}
                      {inv.otherAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Phụ phí:</span>
                          <span className="font-medium text-slate-800">{formatter.format(inv.otherAmount)}</span>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  <CardContent className="pt-0 border-t border-slate-100 mt-2 p-4 bg-slate-50/50">
                    <TenantInvoiceDetailsDialog invoice={inv} triggerLabel="Quét mã QR thanh toán ngay" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Paid Invoices History Section */}
      {paidInvoices.length > 0 && (
        <section className="pt-2 sm:pt-4">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold leading-tight text-slate-800 sm:text-xl">Lịch sử hóa đơn đã thanh toán</h2>
            <Badge variant="outline" className="ml-2 font-semibold text-emerald-700 bg-emerald-50 border-emerald-200">
              {paidInvoices.length}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paidInvoices.map(inv => (
              <Card key={inv.id} className="bg-white/80 border-slate-200 shadow-xs hover:shadow-sm transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-800">
                      Tháng {inv.month}/{inv.year}
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none text-xs font-medium">
                      Đã thanh toán
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    Tổng tiền: <span className="font-bold text-slate-700">{formatter.format(inv.totalAmount)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-1">
                  <TenantInvoiceDetailsDialog invoice={inv} triggerLabel="Xem chi tiết hóa đơn" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
