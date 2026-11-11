import { fetchWithAuth } from "@/lib/auth-fetch";
import Image from "next/image";
import { format } from "date-fns";
import { MaintenanceRequest } from "@/types";
import { Wrench, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TenantCreateMaintenanceDialog } from "@/components/maintenance/tenant-create-maintenance-dialog";

async function getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/maintenance`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function TenantMaintenancePage() {
  const requests = await getMaintenanceRequests();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PENDING': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200"><Clock className="w-3 h-3 mr-1"/> Đang chờ</Badge>;
      case 'IN_PROGRESS': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200"><Wrench className="w-3 h-3 mr-1"/> Đang xử lý</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Hoàn thành</Badge>;
      case 'CANCELLED': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200"><AlertCircle className="w-3 h-3 mr-1"/> Đã hủy</Badge>;
      default: return null;
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'URGENT': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return null;
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100/50 rounded-xl text-amber-600">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Yêu cầu Sửa chữa</h1>
            <p className="text-sm text-muted-foreground sm:text-base">Theo dõi tiến độ và báo cáo sự cố trong phòng</p>
          </div>
        </div>

        <TenantCreateMaintenanceDialog />
      </div>

      {requests.length === 0 ? (
        <Card className="bg-white/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-200 mb-4" />
            <p className="font-medium text-slate-600 mb-1">Mọi thứ đều hoạt động tốt!</p>
            <p className="text-sm">Phòng của bạn chưa có yêu cầu sửa chữa nào.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map(req => (
            <Card key={req.id} className="overflow-hidden bg-white hover:shadow-md transition-all border-slate-200/60">
              <CardHeader className="pb-2 bg-slate-50/50 border-b">
                <div className="flex flex-col items-start justify-between gap-2 min-[480px]:flex-row min-[480px]:items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base break-words">
                      {req.title}
                      {getPriorityIcon(req.priority)}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Gửi lúc: {format(new Date(req.createdAt), "dd/MM/yyyy HH:mm")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{req.description}</p>
                {req.imageUrl && (
                  <div className="mt-3">
                    <Image src={req.imageUrl} alt="Minh chứng" width={240} height={96} unoptimized className="h-24 w-auto rounded-md border border-slate-200 object-cover" />
                  </div>
                )}
                {req.cost && req.cost > 0 && (
                  <div className="mt-4 pt-3 border-t text-sm flex justify-between">
                    <span className="text-slate-500">Chi phí dự kiến/thực tế:</span>
                    <span className="font-medium text-slate-800">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(req.cost)}
                    </span>
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
