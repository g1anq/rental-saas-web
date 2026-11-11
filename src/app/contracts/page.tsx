import { Contract, Room, Tenant } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUtilityReadingDialog } from "@/components/contracts/create-utility-reading-dialog";
import { CreateContractDialog } from "@/components/contracts/create-contract-dialog";
import { ContractDetailsSheet } from "@/components/contracts/contract-details-sheet";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { AlertTriangle } from "lucide-react";

import { PropertyFilter } from "@/components/properties/property-filter";
import { RenewalSuggestionCard } from "@/components/contracts/renewal-suggestion-card";

async function getContracts(propertyId?: string): Promise<Contract[]> {
  const url = propertyId
    ? `${process.env.NEXT_PUBLIC_API_URL}/contracts?propertyId=${propertyId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/contracts`;

  const res = await fetchWithAuth(url, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch contracts");
  return res.json();
}

async function getRenewalSuggestions(): Promise<
  (Contract & { daysUntilExpiration: number })[]
> {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/contracts/renewal-suggestions`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch renewal suggestions");
  return res.json();
}

async function getAvailableRooms(): Promise<Room[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, { cache: "no-store" });
  if (!res.ok) return [];
  const rooms: Room[] = await res.json();
  return rooms.filter(r => r.status === "AVAILABLE");
}

async function getTenants(): Promise<Tenant[]> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, { cache: "no-store" });
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

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ propertyId?: string }> }) {
  const resolvedParams = await searchParams;
  const [contracts, renewalSuggestions, availableRooms, tenants, properties] = await Promise.all([
    getContracts(resolvedParams.propertyId),
    getRenewalSuggestions(),
    getAvailableRooms(),
    getTenants(),
    getProperties()
  ]);
  const contractIds = new Set(contracts.map((contract) => contract.id));
  const visibleRenewalSuggestions = renewalSuggestions.filter((contract) =>
    contractIds.has(contract.id),
  );

  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Hợp đồng thuê</h2>
        <div className="flex items-center gap-3">
          <PropertyFilter properties={properties} />
          <CreateContractDialog availableRooms={availableRooms} tenants={tenants} />
        </div>
      </div>

      {visibleRenewalSuggestions.length > 0 && (
        <section
          aria-labelledby="renewal-suggestions-title"
          className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 sm:p-5"
        >
          <div className="space-y-1">
            <h3
              id="renewal-suggestions-title"
              className="font-semibold text-amber-950"
            >
              Đề xuất gia hạn hợp đồng
            </h3>
            <p className="text-sm text-amber-800">
              Có {visibleRenewalSuggestions.length} hợp đồng sẽ hết hạn trong
              30 ngày tới. Chọn gia hạn để cập nhật thời hạn.
            </p>
          </div>
          <div className="space-y-3">
            {visibleRenewalSuggestions.map((contract) => (
              <RenewalSuggestionCard
                key={contract.id}
                contract={contract}
              />
            ))}
          </div>
        </section>
      )}

      <Card className="border-none shadow-sm bg-white/70 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Phòng</th>
                <th className="px-6 py-4 font-medium">Khách thuê</th>
                <th className="px-6 py-4 font-medium">Ngày bắt đầu</th>
                <th className="px-6 py-4 font-medium">Tiền cọc</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Chưa có hợp đồng nào.
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => {
                  const now = new Date();
                  const endDate = contract.endDate ? new Date(contract.endDate) : null;
                  const daysLeft = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
                  const isExpiringSoon = contract.isActive && daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
                  const isExpired = contract.isActive && daysLeft !== null && daysLeft < 0;

                  return (
                    <tr key={contract.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{contract.room?.name}</td>
                      <td className="px-6 py-4 text-slate-600">{contract.tenant?.fullName}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{formatter.format(contract.deposit)}</td>
                      <td className="px-6 py-4 flex flex-col gap-1 items-start">
                        <Badge
                          variant={contract.isActive ? "default" : "secondary"}
                          className={contract.isActive ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}
                        >
                          {contract.isActive ? "Đang hiệu lực" : "Đã kết thúc"}
                        </Badge>
                        {isExpiringSoon && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> Sắp hết hạn ({daysLeft} ngày)
                          </span>
                        )}
                        {isExpired && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Quá hạn ({Math.abs(daysLeft!)} ngày)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ContractDetailsSheet contract={contract} />
                          {contract.isActive && (
                            <CreateUtilityReadingDialog contractId={contract.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
