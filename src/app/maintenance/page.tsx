import { MaintenanceRequest, Room } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { CreateMaintenanceDialog } from "@/components/maintenance/create-maintenance-dialog";
import { UpdateMaintenanceDialog } from "@/components/maintenance/update-maintenance-dialog";
import { format } from "date-fns";
import { PropertyFilter } from "@/components/properties/property-filter";

async function getMaintenanceRequests(propertyId?: string): Promise<MaintenanceRequest[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/maintenance?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/maintenance`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getRooms(): Promise<Room[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

const statusMap = {
  PENDING: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "Đang sửa", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Đã xong", color: "bg-emerald-100 text-emerald-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-100 text-slate-700" },
};

const priorityMap = {
  LOW: { label: "Thấp", color: "text-slate-500" },
  MEDIUM: { label: "Vừa", color: "text-blue-500" },
  HIGH: { label: "Cao", color: "text-orange-500" },
  URGENT: { label: "Khẩn cấp", color: "text-red-600 font-bold" },
};

async function getProperties() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [requests, rooms, properties] = await Promise.all([
    getMaintenanceRequests(resolvedParams.propertyId),
    getRooms(),
    getProperties(),
  ]);

  const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
  const filteredRequests = requests.filter(req => !req.title.startsWith("Yêu cầu"));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Bảo trì</h2>
          <p className="text-muted-foreground mt-1">Tiếp nhận và xử lý sự cố thiết bị từ phòng trọ.</p>
        </div>
        <div className="flex items-center gap-3">
          <PropertyFilter properties={properties} />
          <CreateMaintenanceDialog rooms={rooms} />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Phòng</th>
                <th className="px-6 py-4">Sự cố</th>
                <th className="px-6 py-4">Độ ưu tiên</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Chi phí</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Chưa có yêu cầu bảo trì nào
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {req.room?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-slate-800">{req.title}</div>
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px] mt-1 whitespace-pre-wrap">{req.description || "Không có mô tả"}</div>
                      <div className="text-xs text-slate-400 mt-1">{format(new Date(req.createdAt), "dd/MM/yyyy HH:mm")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={priorityMap[req.priority].color}>
                        {priorityMap[req.priority].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusMap[req.status].color} variant="secondary">
                        {statusMap[req.status].label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {req.cost ? formatter.format(req.cost) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UpdateMaintenanceDialog request={req} />
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
