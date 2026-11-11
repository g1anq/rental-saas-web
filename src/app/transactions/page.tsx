import { fetchWithAuth } from "@/lib/auth-fetch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

async function getTransactions() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const totalIncome = transactions.filter((t: any) => t.type === 'INCOME').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t: any) => t.type === 'EXPENSE').reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Lịch sử Giao dịch (Sổ quỹ)</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Thu</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{formatter.format(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Chi</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">-{formatter.format(totalExpense)}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lợi nhuận ròng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              {formatter.format(totalIncome - totalExpense)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Thời gian</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Số tiền</th>
                <th className="px-6 py-4 font-medium">Mô tả</th>
                <th className="px-6 py-4 font-medium">Phòng</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chưa có giao dịch nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">
                      {format(new Date(tx.date), "dd/MM/yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'INCOME' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Thu</Badge>
                      ) : (
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-none">Chi</Badge>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-medium ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatter.format(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">{tx.description}</td>
                    <td className="px-6 py-4 text-slate-500">{tx.room?.name || '-'}</td>
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
