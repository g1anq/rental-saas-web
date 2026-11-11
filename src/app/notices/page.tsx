import { Notice } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { CreateNoticeDialog } from "@/components/notices/create-notice-dialog";
import { UpdateNoticeDialog } from "@/components/notices/update-notice-dialog";
import { format } from "date-fns";
import { Bell, AlertTriangle } from "lucide-react";
import { PropertyFilter } from "@/components/properties/property-filter";

async function getNotices(propertyId?: string): Promise<Notice[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/notices?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/notices`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

async function getRooms() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
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

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [notices, rooms, properties] = await Promise.all([
    getNotices(resolvedParams.propertyId),
    getRooms(),
    getProperties(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Bảng Thông Báo</h2>
          <p className="text-muted-foreground mt-1">Quản lý và ghim các thông báo chung hoặc riêng từng phòng.</p>
        </div>
        <div className="flex items-center gap-3">
          <PropertyFilter properties={properties} />
          <CreateNoticeDialog rooms={rooms} properties={properties} />
        </div>
      </div>

      {notices.length === 0 ? (
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md flex flex-col items-center justify-center h-64">
          <Bell className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Chưa có thông báo nào</h3>
          <p className="text-sm text-slate-400">Hãy tạo thông báo đầu tiên cho khách thuê.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notices.map((notice) => (
            <Card
              key={notice.id}
              className={`border transition-all hover:shadow-md ${notice.isImportant ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-white/80'} backdrop-blur-sm relative overflow-hidden`}
            >
              {notice.isImportant && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500 text-white flex items-start justify-end p-2 rounded-bl-[40px] shadow-sm">
                  <AlertTriangle className="w-4 h-4 mr-1 mt-1" />
                </div>
              )}
              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start pr-12">
                  <CardTitle className="text-lg font-bold text-slate-800 leading-tight">
                    {notice.title}
                  </CardTitle>
                </div>
                <div className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-1">
                  Ngày đăng: {format(new Date(notice.createdAt), "dd/MM/yyyy HH:mm")}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {notice.content}
                </p>
              </CardContent>
              <CardFooter className="pt-2 pb-3 border-t border-slate-100/50 mt-4 flex justify-between items-center">
                <Badge variant={notice.isImportant ? "destructive" : "secondary"} className="font-normal px-2 py-0.5 text-[10px]">
                  {notice.isImportant ? "Quan trọng" : "Nội bộ"}
                </Badge>
                <div className="flex items-center gap-2">
                  {notice.property && (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      Khu: {notice.property.name}
                    </Badge>
                  )}
                  {notice.room && (
                    <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                      Phòng: {notice.room.name}
                    </Badge>
                  )}
                  <UpdateNoticeDialog notice={notice} rooms={rooms} properties={properties} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
