import { fetchWithAuth } from "@/lib/auth-fetch";
import Image from "next/image";
import { format } from "date-fns";
import { UtilityReading } from "@/types";
import { BarChart3, Zap, Droplet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TenantSubmitUtilityDialog } from "@/components/utilities/tenant-submit-utility-dialog";

async function getUtilityReadings(): Promise<UtilityReading[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/utility-readings`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TenantUtilitiesPage() {
  const readings = await getUtilityReadings();

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Chỉ số Điện Nước</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Theo dõi và tự khai báo chỉ số tiêu thụ hàng tháng</p>
          </div>
        </div>

        <TenantSubmitUtilityDialog />
      </div>

      {readings.length === 0 ? (
        <Card className="bg-white/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Zap className="w-12 h-12 text-slate-200 mb-4" />
            <p className="font-medium text-slate-600 mb-1">Chưa có dữ liệu!</p>
            <p className="text-sm">Bạn hoặc chủ trọ chưa ghi số điện nước tháng nào.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {readings.map(reading => (
            <Card key={reading.id} className="overflow-hidden bg-white hover:shadow-md transition-all border-slate-200/60">
              <CardHeader className="pb-3 bg-slate-50/50 border-b">
                <CardTitle className="text-base text-slate-700">
                  Tháng {reading.month}/{reading.year}
                </CardTitle>
                <CardDescription className="text-xs">
                  Cập nhật: {format(new Date(reading.updatedAt), "dd/MM/yyyy HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  <div className="space-y-2 p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-amber-500 font-medium mb-2">
                      <Zap className="w-4 h-4" /> Điện
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Số cũ:</span>
                      <span className="font-medium text-slate-700">{reading.electricityPrev}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Số mới:</span>
                      <span className="font-medium text-slate-700">{reading.electricityCurr}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-slate-500">Tiêu thụ:</span>
                      <span className="font-bold text-amber-600">{reading.electricityCurr - reading.electricityPrev} kWh</span>
                    </div>
                  </div>
                  <div className="space-y-2 bg-blue-50/30 p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-blue-500 font-medium mb-2">
                      <Droplet className="w-4 h-4" /> Nước
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Số cũ:</span>
                      <span className="font-medium text-slate-700">{reading.waterPrev}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Số mới:</span>
                      <span className="font-medium text-slate-700">{reading.waterCurr}</span>
                    </div>
                    <div className="pt-2 border-t flex justify-between text-sm">
                      <span className="text-slate-500">Tiêu thụ:</span>
                      <span className="font-bold text-blue-600">{reading.waterCurr - reading.waterPrev} m3</span>
                    </div>
                  </div>
                </div>
                {reading.imageUrl && (
                  <div className="p-4 border-t bg-slate-50/50">
                    <p className="text-xs text-slate-500 mb-2 font-medium">Ảnh chụp công tơ/đồng hồ:</p>
                    <div className="relative h-32 w-full">
                      <Image src={reading.imageUrl} alt="Minh chứng chỉ số" fill unoptimized sizes="100vw" className="rounded-md border border-slate-200 object-cover" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
