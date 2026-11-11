import { Property } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Building, MapPin, Search } from "lucide-react";
import { CreatePropertyDialog } from "@/components/properties/create-property-dialog";
import { UpdatePropertyDialog } from "@/components/properties/update-property-dialog";

async function getProperties(): Promise<Property[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PropertiesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Khu Trọ</h2>
          <p className="text-muted-foreground mt-1">Quản lý nhiều khu nhà, tòa nhà ở các địa chỉ khác nhau.</p>
        </div>
        <CreatePropertyDialog />
      </div>

      {properties.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50 flex flex-col items-center justify-center h-64 shadow-sm">
          <Building className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-600">Chưa có khu trọ nào</h3>
          <p className="text-sm text-slate-400 mt-1">Thêm khu trọ đầu tiên để bắt đầu quản lý phòng.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="border hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm overflow-hidden group">
              <CardHeader className="pb-4 relative bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Building className="w-5 h-5 text-indigo-500" />
                      {property.name}
                    </CardTitle>
                    <div className="text-sm text-slate-500 flex items-start gap-1.5 mt-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{property.address}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <UpdatePropertyDialog property={property} />
                </div>
              </CardHeader>
              <CardContent className="pt-4 border-t border-slate-100 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Số phòng</span>
                    <span className="text-2xl font-bold text-slate-700">{property._count?.rooms || 0}</span>
                  </div>
                  {property.description && (
                    <div className="text-xs text-slate-500 max-w-[150px] text-right line-clamp-2">
                      {property.description}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
