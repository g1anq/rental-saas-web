"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CashFlowData {
  name: string;
  income: number;
  expense: number;
  net: number;
}

interface PropertyRevenueData {
  name: string;
  revenue: number;
}

interface DashboardChartsProps {
  data: {
    monthly: CashFlowData[];
    quarterly: CashFlowData[];
    propertyPerformance: PropertyRevenueData[];
  };
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

  const formatCompact = (value: number) => {
    if (value === 0) return "0";
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}tr`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const renderCashFlowChart = (chartData: CashFlowData[]) => (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
          <Tooltip
            formatter={(value: any, name: any) => [
              formatCurrency(Number(value || 0)),
              name === 'income' ? 'Tổng thu' : name === 'expense' ? 'Tổng chi' : 'Lợi nhuận ròng'
            ]}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="income" name="Tổng thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" name="Tổng chi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="net" name="Lợi nhuận ròng" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <Card className="col-span-4 border-none shadow-sm bg-white/70 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-slate-800">Biểu đồ & Thống kê</CardTitle>
      </CardHeader>
      <CardContent className="pl-2 pr-4 pb-4">
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="mb-4 ml-4">
            <TabsTrigger value="monthly">Theo Tháng</TabsTrigger>
            <TabsTrigger value="quarterly">Theo Quý</TabsTrigger>
            <TabsTrigger value="properties">Theo Khu Trọ</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            {renderCashFlowChart(data.monthly)}
          </TabsContent>

          <TabsContent value="quarterly">
            {renderCashFlowChart(data.quarterly)}
          </TabsContent>

          <TabsContent value="properties">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.propertyPerformance} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Doanh thu']}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
