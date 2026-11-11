"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Property } from "@/types";
import { Building } from "lucide-react";

export function PropertyFilter({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPropertyId = searchParams.get("propertyId") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const propertyId = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (propertyId) {
      params.set("propertyId", propertyId);
    } else {
      params.delete("propertyId");
    }

    router.push(`?${params.toString()}`);
  };

  if (!properties || properties.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-slate-200 shadow-sm">
      <Building className="w-4 h-4 text-slate-500" />
      <select
        className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 min-w-[150px]"
        value={currentPropertyId}
        onChange={handleChange}
      >
        <option value="">Tất cả khu trọ</option>
        {properties.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
    </div>
  );
}
