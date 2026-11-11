import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AdvancedDashboardStats,
  DashboardStats,
  Invoice,
  Property,
} from "@/types";
import { Home, Users, ReceiptText, ArrowRight, TrendingDown, Wallet, CalendarClock } from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { DashboardAnalytics } from "@/components/dashboard-analytics";
import { PropertyFilter } from "@/components/properties/property-filter";
import { fetchWithAuth } from "@/lib/auth-fetch";
import Link from "next/link";

// Fallback defaults khi API lỗi
const DEFAULT_STATS: DashboardStats = {
  rooms: { total: 0, available: 0, rented: 0, maintenance: 0, occupancyRate: 0 },
  tenants: { total: 0, activeContracts: 0 },
  invoices: { unpaid: 0, overdue: 0 },
  revenue: { currentMonth: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  vulnerabilities: {
    unpaidRate: 0,
    depositsToRefund: 0,
    inactiveContractsDetails: [],
    expiringContractsDetails: [],
  }
};

async function getStats(propertyId?: string): Promise<DashboardStats> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`,
    );
    if (propertyId) url.searchParams.set("propertyId", propertyId);
    const res = await fetchWithAuth(url.toString(), { cache: "no-store" });
    if (!res.ok) return DEFAULT_STATS;
    return res.json();
  } catch {
    return DEFAULT_STATS;
  }
}

const DEFAULT_ADVANCED_STATS: AdvancedDashboardStats = {
  monthly: [],
  quarterly: [],
  propertyPerformance: [],
  occupancy: { total: 0, rented: 0, available: 0, maintenance: 0, rate: 0 },
  forecast: {
    revenue: 0,
    basedOnMonths: 0,
    method: "average_of_previous_3_completed_months",
  },
};

async function getAdvancedStats(
  propertyId?: string,
): Promise<AdvancedDashboardStats> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/advanced-stats`,
    );
    if (propertyId) url.searchParams.set("propertyId", propertyId);
    const res = await fetchWithAuth(url.toString(), { cache: "no-store" });
    if (!res.ok) return DEFAULT_ADVANCED_STATS;
    return res.json();
  } catch {
    return DEFAULT_ADVANCED_STATS;
  }
}

async function getProperties(): Promise<Property[]> {
  try {
    const res = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/properties`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getUnpaidInvoices(propertyId?: string): Promise<Invoice[]> {
  try {
    const url = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/dashboard/unpaid-invoices`,
    );
    if (propertyId) url.searchParams.set("propertyId", propertyId);
    const res = await fetchWithAuth(url.toString(), { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const { propertyId } = await searchParams;
  const [stats, advancedStats, unpaidInvoices, properties] = await Promise.all([
    getStats(propertyId),
    getAdvancedStats(propertyId),
    getUnpaidInvoices(propertyId),
    getProperties(),
  ]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Tổng quan</h2>
        <div className="flex flex-wrap items-center gap-3">
          <PropertyFilter properties={properties} />
          <p className="text-sm text-slate-500">
            Tháng {stats.revenue.month}/{stats.revenue.year}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Doanh thu tháng này</CardTitle>
            <ReceiptText className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {formatter.format(stats.revenue.currentMonth)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Chỉ tính hóa đơn đã thanh toán</p>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Phòng đang thuê</CardTitle>
            <Home className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {stats.rooms.rented} / {stats.rooms.total}
            </div>
            <p className={`text-xs mt-1 font-medium ${stats.rooms.occupancyRate < 80 ? 'text-rose-500' : 'text-emerald-500'}`}>
              Tỷ lệ lấp đầy {stats.rooms.occupancyRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Khách thuê</CardTitle>
            <Users className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.tenants.total}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats.tenants.activeContracts} hợp đồng đang hiệu lực
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-rose-50/80 backdrop-blur-md border border-rose-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">Tỷ lệ Nợ xấu</CardTitle>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">
              {stats.vulnerabilities?.unpaidRate ?? 0}%
            </div>
            <p className="text-xs text-rose-600/80 mt-1 flex gap-2">
              <span className="font-medium">{stats.invoices.unpaid + stats.invoices.overdue} hóa đơn chưa thu</span>
              ({formatter.format(stats.invoices.unpaidAmount ?? 0)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerabilities & Alerts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm bg-amber-50/80 backdrop-blur-md border border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-amber-700">Cọc chờ hoàn trả (Thanh lý)</CardTitle>
              <p className="text-xs text-amber-600/80">Các hợp đồng đã thanh lý chưa được hoàn cọc</p>
            </div>
            <Wallet className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 mb-2">
              {formatter.format(stats.vulnerabilities?.depositsToRefund ?? 0)}
            </div>
            <div className="space-y-2">
              {stats.vulnerabilities?.inactiveContractsDetails?.slice(0, 3).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-amber-200/50 pb-1 last:border-0">
                  <span className="text-amber-800">{c.room.name} - {c.tenant.fullName}</span>
                  <span className="font-medium text-amber-700">{formatter.format(c.deposit)}</span>
                </div>
              ))}
              {(stats.vulnerabilities?.inactiveContractsDetails?.length || 0) === 0 && (
                <p className="text-xs text-amber-600/60 italic">Không có khoản cọc nào đang treo.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-blue-50/80 backdrop-blur-md border border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-blue-700">Hợp đồng sắp hết hạn (30 ngày)</CardTitle>
              <p className="text-xs text-blue-600/80">Chuẩn bị gia hạn hoặc thanh lý để tránh gián đoạn</p>
            </div>
            <CalendarClock className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 mb-2">
              {stats.vulnerabilities?.expiringContractsDetails?.length || 0} <span className="text-lg font-normal">hợp đồng</span>
            </div>
            <div className="space-y-2">
              {stats.vulnerabilities?.expiringContractsDetails?.slice(0, 3).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-blue-200/50 pb-1 last:border-0">
                  <span className="text-blue-800">{c.room.name}</span>
                  <Badge variant="outline" className="bg-white/50 text-blue-700 border-blue-200">
                    {new Date(c.endDate).toLocaleDateString("vi-VN")}
                  </Badge>
                </div>
              ))}
              {(stats.vulnerabilities?.expiringContractsDetails?.length || 0) === 0 && (
                <p className="text-xs text-blue-600/60 italic">Không có hợp đồng nào sắp hết hạn.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardAnalytics data={advancedStats} />

      {/* Charts + Unpaid Invoices Table */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Bar Chart */}
        <div className="col-span-1 lg:col-span-4">
          <DashboardCharts data={advancedStats} />
        </div>

        {/* Unpaid Invoices */}
        <Card className="col-span-1 lg:col-span-3 border-none shadow-sm bg-white/70 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">Hóa đơn chưa thu</CardTitle>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {unpaidInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <ReceiptText className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Không có hóa đơn chưa thu 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {unpaidInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {invoice.contract?.room?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {invoice.contract?.tenant?.fullName} · T{invoice.month}/{invoice.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatter.format(invoice.totalAmount)}
                      </span>
                      <Badge
                        className={
                          invoice.status === "OVERDUE"
                            ? "bg-rose-100 text-rose-700 border-none text-xs"
                            : "bg-amber-100 text-amber-700 border-none text-xs"
                        }
                      >
                        {invoice.status === "OVERDUE" ? "Quá hạn" : "Chưa thu"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
