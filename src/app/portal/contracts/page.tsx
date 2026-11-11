import { fetchWithAuth } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Contract, Tenant } from "@/types";
import { FileText, Calendar, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { RoommatesSection } from "@/components/portal/roommates-section";

async function getProfile(): Promise<Tenant & { contract?: Contract }> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/me`, { cache: 'no-store' });
  if (!res.ok) redirect("/login");
  return res.json();
}

export default async function TenantContractsPage() {
  const profile = await getProfile();
  const contract = profile.contract;
  const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <p>Bạn chưa có hợp đồng nào đang hoạt động.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Hợp đồng thuê phòng</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Chi tiết hợp đồng Phòng {contract.room?.name}</p>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md">
        <CardHeader className="bg-slate-50/50 border-b pb-4">
          <CardTitle className="text-lg flex justify-between items-center">
            Thông tin cơ bản
            <span className="text-sm font-normal px-3 py-1 bg-green-100 text-green-700 rounded-full">Đang hiệu lực</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Ngày bắt đầu</p>
                <p className="font-medium text-slate-800">{format(new Date(contract.startDate), "dd/MM/yyyy")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Ngày kết thúc</p>
                <p className="font-medium text-slate-800">
                  {contract.endDate ? format(new Date(contract.endDate), "dd/MM/yyyy") : "Vô thời hạn"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-sm text-slate-500">Tiền cọc</p>
                <p className="font-medium text-slate-800">{formatter.format(contract.deposit)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="text-slate-400 font-bold text-lg leading-none">⚡</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Giá điện</p>
                <p className="font-medium text-slate-800">{formatter.format(contract.electricityRate)} / kWh</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <span className="text-slate-400 font-bold text-lg leading-none">💧</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Giá nước</p>
                <p className="font-medium text-slate-800">{formatter.format(contract.waterRate)} / khối</p>
              </div>
            </div>
          </div>
        </CardContent>
        {contract.notes && (
          <CardContent className="border-t bg-slate-50/30 p-4 sm:p-6">
            <p className="text-sm text-slate-500 mb-1 font-medium">Ghi chú hợp đồng</p>
            <p className="text-slate-700 whitespace-pre-wrap">{contract.notes}</p>
          </CardContent>
        )}
      </Card>

      {/* Roommates Section */}
      <RoommatesSection roommates={contract.roommates || []} />
    </div>
  );
}
