"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { AdvancedDashboardStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardAnalytics({
  data,
}: {
  data: AdvancedDashboardStats;
}) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const formatCompact = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return String(value);
  };

  return (
    <section
      aria-label="Phân tích doanh thu và tình trạng phòng"
      className="grid gap-6 lg:grid-cols-3"
    >
      <Card className="border-none shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">
            Xu hướng doanh thu 12 tháng
          </CardTitle>
          <p className="text-xs text-slate-500">
            Doanh thu ghi nhận theo ngày giao dịch
          </p>
        </CardHeader>
        <CardContent className="pl-2 pr-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.monthly}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatCompact}
                  width={48}
                />
                <Tooltip
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Doanh thu",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Doanh thu"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        <Card className="border-none bg-emerald-50/80 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm font-medium text-emerald-800">
                Dự đoán doanh thu tháng tới
              </CardTitle>
              <p className="text-xs text-emerald-700">
                Trung bình {data.forecast.basedOnMonths} tháng đã hoàn tất gần
                nhất
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(data.forecast.revenue)}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              Ước tính tham khảo, không phải cam kết doanh thu.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Tỷ lệ lấp đầy phòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-2xl font-bold text-slate-900">
                {data.occupancy.rate}%
              </p>
              <p className="text-xs text-slate-500">
                {data.occupancy.rented}/{data.occupancy.total} phòng đang thuê
              </p>
            </div>
            <div
              className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-label="Tỷ lệ lấp đầy phòng"
              aria-valuenow={data.occupancy.rate}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-blue-500 transition-[width]"
                style={{ width: `${data.occupancy.rate}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>{data.occupancy.available} phòng trống</span>
              <span>{data.occupancy.maintenance} bảo trì</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
