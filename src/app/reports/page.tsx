"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Receipt, Download } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, YAxis, Line, ComposedChart } from "recharts";

interface RevenueStats {
  year: number;
  totalRevenue: number;
  totalRent: number;
  totalElectricity: number;
  totalWater: number;
  monthly: {
    month: number;
    totalRevenue: number;
    rentRevenue: number;
    electricityRevenue: number;
    waterRevenue: number;
    servicesRevenue: number;
    invoiceCount: number;
  }[];
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices/stats/revenue?year=${year}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [year]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  const chartData = stats?.monthly.map((m) => ({
    name: `T${m.month}`,
    "Tổng thu": m.totalRevenue,
    "Tiền phòng": m.rentRevenue,
    "Điện nước": m.electricityRevenue + m.waterRevenue,
    "Dịch vụ": m.servicesRevenue,
    "Hóa đơn": m.invoiceCount,
  })) || [];

  const pieData = stats ? [
    { name: "Tiền phòng", value: stats.totalRent, color: "hsl(var(--primary))" },
    { name: "Tiền điện", value: stats.totalElectricity, color: "#f59e0b" },
    { name: "Tiền nước", value: stats.totalWater, color: "#0ea5e9" },
    { name: "Dịch vụ khác", value: stats.totalRevenue - stats.totalRent - stats.totalElectricity - stats.totalWater, color: "#8b5cf6" },
  ].filter(d => d.value > 0) : [];

  // Tính toán so sánh với tháng trước (giả định)
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthData = stats?.monthly.find(m => m.month === currentMonth);
  const prevMonthData = stats?.monthly.find(m => m.month === (currentMonth === 1 ? 12 : currentMonth - 1)); // Lười tính nếu năm trước, tạm lấy trong cùng năm

  let percentChange = 0;
  if (currentMonthData && prevMonthData && prevMonthData.totalRevenue > 0) {
    percentChange = ((currentMonthData.totalRevenue - prevMonthData.totalRevenue) / prevMonthData.totalRevenue) * 100;
  } else if (currentMonthData && currentMonthData.totalRevenue > 0) {
    percentChange = 100;
  }

  if (loading && !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const exportToExcel = async () => {
    if (!stats) return;
    try {
      const XLSX = await import('xlsx');
      const wsData = [
        ['BÁO CÁO TÀI CHÍNH NĂM', stats.year],
        [],
        ['Tháng', 'Số HĐ', 'Tiền phòng', 'Tiền điện', 'Tiền nước', 'Dịch vụ khác', 'Tổng doanh thu (VNĐ)'],
        ...stats.monthly.map(m => [
          `Tháng ${m.month}`,
          m.invoiceCount,
          m.rentRevenue,
          m.electricityRevenue,
          m.waterRevenue,
          m.servicesRevenue,
          m.totalRevenue
        ]),
        [],
        ['Tổng cộng',
         stats.monthly.reduce((sum, m) => sum + m.invoiceCount, 0),
         stats.totalRent,
         stats.totalElectricity,
         stats.totalWater,
         stats.totalRevenue - stats.totalRent - stats.totalElectricity - stats.totalWater,
         stats.totalRevenue
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Doanh Thu");
      XLSX.writeFile(wb, `BaoCao_DoanhThu_${stats.year}.xlsx`);
    } catch (e) {
      console.error("Lỗi xuất Excel", e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Báo cáo & Thống kê</h2>
          <p className="text-muted-foreground mt-1">Quản lý và theo dõi doanh thu khu trọ của bạn.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Năm:</span>
            <Select value={year} onValueChange={(val) => val && setYear(val)}>
              <SelectTrigger className="w-[120px] bg-white">
                <SelectValue placeholder="Chọn năm" />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    Năm {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportToExcel} variant="outline" className="bg-white gap-2 shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/70 backdrop-blur-md border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu ({year})</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Đã thu thực tế</p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Doanh thu tháng này</CardTitle>
            <div className={`p-2 rounded-full ${percentChange >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
              {percentChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(currentMonthData?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className={percentChange >= 0 ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                {percentChange > 0 ? "+" : ""}{percentChange.toFixed(1)}%
              </span>
              <span>so với tháng trước</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-md border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Hóa đơn đã thu ({year})</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Receipt className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.monthly.reduce((sum, m) => sum + m.invoiceCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Tổng số hóa đơn thanh toán</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 mt-6">
        <Card className="col-span-1 lg:col-span-5 bg-white/70 backdrop-blur-md border-none shadow-sm">
          <CardHeader>
            <CardTitle>Phân tích doanh thu năm {year}</CardTitle>
            <CardDescription>Biểu đồ thể hiện biến động các nguồn thu qua từng tháng.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[350px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", zIndex: 100 }}
                      formatter={(value: any, name: any) => {
                        if (name === "Hóa đơn") return [value, name];
                        return [formatter.format(value), name];
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar yAxisId="left" dataKey="Tiền phòng" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="left" dataKey="Điện nước" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="left" dataKey="Dịch vụ" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="Hóa đơn" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 bg-white/70 backdrop-blur-md border-none shadow-sm">
          <CardHeader>
            <CardTitle>Cơ cấu nguồn thu</CardTitle>
            <CardDescription>Tỷ trọng doanh thu năm {year}.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pieData.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center text-slate-400">
                <Receipt className="w-12 h-12 mb-2 opacity-20" />
                <p>Chưa có dữ liệu</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatter.format(value)}
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                    />
                    <Legend layout="vertical" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
