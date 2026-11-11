import { Tenant } from "@/types";
import { Card } from "@/components/ui/card";
import { CreateTenantDialog } from "@/components/tenants/create-tenant-dialog";
import { TenantDetailsDialog } from "@/components/tenants/tenant-details-dialog";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { PropertyFilter } from "@/components/properties/property-filter";

async function getTenants(propertyId?: string): Promise<Tenant[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/tenants?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/tenants`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch tenants");
  return res.json();
}

async function getProperties() {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function TenantsPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [tenants, properties] = await Promise.all([getTenants(resolvedParams.propertyId), getProperties()]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Quản lý Khách thuê</h2>
        <div className="flex items-center gap-3">
          <PropertyFilter properties={properties} />
          <CreateTenantDialog />
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Họ và tên</th>
                <th className="px-6 py-4 font-medium">Số điện thoại</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Phòng</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chưa có khách thuê nào.
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{tenant.fullName}</td>
                    <td className="px-6 py-4 text-slate-600">{tenant.phone}</td>
                    <td className="px-6 py-4">
                      {tenant.roommateOfContract ? (
                        <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          Người ở ghép
                        </span>
                      ) : tenant.contracts && tenant.contracts.length > 0 ? (
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                          Đứng tên HĐ
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/20">
                          Chưa thuê
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {tenant.roommateOfContract?.room?.name || tenant.contracts?.[0]?.room?.name || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <TenantDetailsDialog tenant={tenant} />
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
