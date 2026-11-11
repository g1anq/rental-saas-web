"use client";

import { Room, Property } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoomDetailsDialog } from "@/components/rooms/room-details-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { differenceInDays } from "date-fns";

export function RoomsView({ rooms, properties }: { rooms: Room[], properties: Property[] }) {
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const getRoomStatusDetails = (room: Room) => {
    if (room.status === "MAINTENANCE") return { label: "Đang bảo trì", bgColor: "bg-amber-50", borderColor: "border-amber-400", headerColor: "bg-amber-100 text-amber-800 border-amber-200", badgeColor: "bg-amber-500 text-white hover:bg-amber-600" };
    if (room.status === "AVAILABLE") return { label: "Phòng trống", bgColor: "bg-emerald-50", borderColor: "border-emerald-400", headerColor: "bg-emerald-100 text-emerald-800 border-emerald-200", badgeColor: "bg-emerald-500 text-white hover:bg-emerald-600" };

    if (room.contracts && room.contracts.length > 0) {
      const activeContract = room.contracts[0];
      if (activeContract.endDate) {
        const daysLeft = differenceInDays(new Date(activeContract.endDate), new Date());
        if (daysLeft <= 30) {
          return { label: "Sắp trả phòng", bgColor: "bg-orange-50", borderColor: "border-orange-400", headerColor: "bg-orange-100 text-orange-800 border-orange-200", badgeColor: "bg-orange-500 text-white hover:bg-orange-600" };
        }
      }
    }

    return { label: "Đang thuê", bgColor: "bg-blue-50", borderColor: "border-blue-400", headerColor: "bg-blue-100 text-blue-800 border-blue-200", badgeColor: "bg-blue-500 text-white hover:bg-blue-600" };
  };

  return (
    <Tabs defaultValue="grid" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="bg-slate-100/50">
          <TabsTrigger value="grid" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Sơ đồ phòng
          </TabsTrigger>
          <TabsTrigger value="table" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <List className="w-4 h-4 mr-2" />
            Dạng bảng
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="table" className="mt-0">
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Tên phòng</th>
                  <th className="px-6 py-4 font-medium">Giá thuê</th>
                  <th className="px-6 py-4 font-medium">Diện tích</th>
                  <th className="px-6 py-4 font-medium">Sức chứa</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Khu trọ</th>
                  <th className="px-6 py-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                      Chưa có phòng nào. Hãy thêm phòng mới.
                    </td>
                  </tr>
                ) : (
                  rooms.map((room) => {
                    const statusInfo = getRoomStatusDetails(room);
                    return (
                      <tr key={room.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">{room.name}</td>
                        <td className="px-6 py-4 text-slate-600">{formatter.format(room.price)}</td>
                        <td className="px-6 py-4 text-slate-500">{room.area ? `${room.area} m²` : "—"}</td>
                        <td className="px-6 py-4 text-slate-500">{room.maxCapacity ? `${room.maxCapacity} người` : "—"}</td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className={statusInfo.badgeColor}>
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {room.property ? room.property.name : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <RoomDetailsDialog room={room} properties={properties} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="grid" className="mt-0">
        {rooms.length === 0 ? (
          <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md flex flex-col items-center justify-center h-64">
            <LayoutGrid className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">Chưa có phòng nào</h3>
            <p className="text-sm text-slate-400">Hãy bắt đầu bằng cách thêm phòng mới.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {rooms.map(room => {
              const statusInfo = getRoomStatusDetails(room);
              return (
                <Card key={room.id} className={`border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} overflow-hidden flex flex-col transition-transform hover:scale-105 duration-200 cursor-pointer shadow-sm`}>
                  <div className={`px-4 py-3 border-b ${statusInfo.headerColor} flex justify-between items-center`}>
                    <span className="font-bold">{room.name}</span>
                    <Badge variant="secondary" className={`${statusInfo.badgeColor} border-0 text-[10px] px-2 py-0.5 shadow-sm`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Giá thuê:</span>
                      <span className="font-bold text-slate-800">{formatter.format(room.price)}</span>
                    </div>
                    {(room.area || room.maxCapacity) && (
                      <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                        {room.area && <span className="bg-white/60 px-2 py-1 rounded-md border border-black/5 shadow-sm">{room.area} m²</span>}
                        {room.maxCapacity && <span className="bg-white/60 px-2 py-1 rounded-md border border-black/5 shadow-sm">Tối đa {room.maxCapacity} người</span>}
                      </div>
                    )}
                  </div>
                  <div className="bg-white/40 p-2 flex justify-center border-t border-black/5 hover:bg-white/60 transition-colors">
                    <RoomDetailsDialog room={room} properties={properties} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
