import { Room } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateRoomDialog } from "@/components/rooms/create-room-dialog";
import { RoomsView } from "@/components/rooms/rooms-view";
import { fetchWithAuth } from "@/lib/auth-fetch";

import { PropertyFilter } from "@/components/properties/property-filter";

async function getRooms(propertyId?: string): Promise<Room[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/rooms?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/rooms`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch rooms");
  return res.json();
}

async function getProperties() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [rooms, properties] = await Promise.all([getRooms(resolvedParams.propertyId), getProperties()]);

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Phòng trọ</h2>
        <div className="flex items-center gap-3">
          <PropertyFilter properties={properties} />
          <CreateRoomDialog properties={properties} />
        </div>
      </div>

      <RoomsView rooms={rooms} properties={properties} />
    </div>
  );
}
