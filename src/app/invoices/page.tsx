import { Contract, Invoice } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { BulkCreateInvoiceDialog } from "@/components/invoices/bulk-create-invoice-dialog";
import { BulkSendRemindersDialog } from "@/components/invoices/bulk-send-reminders-dialog";
import { InvoiceDetailsDialog } from "@/components/invoices/invoice-details-dialog";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { PropertyFilter } from "@/components/properties/property-filter";

async function getInvoices(propertyId?: string): Promise<Invoice[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/invoices?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/invoices`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

async function getActiveContracts(): Promise<Contract[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts?active=true`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getProperties() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [invoices, activeContracts, properties] = await Promise.all([
    getInvoices(resolvedParams.propertyId),
    getActiveContracts(),
    getProperties(),
  ]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Hóa đơn</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <PropertyFilter properties={properties} />
          <BulkSendRemindersDialog />
          <BulkCreateInvoiceDialog />
          <CreateInvoiceDialog activeContracts={activeContracts} />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Kỳ</th>
                <th className="px-6 py-4 font-medium">Phòng</th>
                <th className="px-6 py-4 font-medium">Khách thuê</th>
                <th className="px-6 py-4 font-medium">Tổng tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Chưa có hóa đơn nào.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">Tháng {invoice.month}/{invoice.year}</td>
                    <td className="px-6 py-4 text-slate-600">{invoice.contract?.room?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{invoice.contract?.tenant?.fullName}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{formatter.format(invoice.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={invoice.status === "PAID" ? "default" : invoice.status === "UNPAID" ? "outline" : "destructive"}
                        className={
                          invoice.status === "PAID" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : invoice.status === "UNPAID" ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                        }
                      >
                        {invoice.status === "PAID" ? "Đã thu" : invoice.status === "UNPAID" ? "Chưa thu" : "Quá hạn"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceDetailsDialog invoice={invoice} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
