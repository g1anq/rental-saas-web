"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Contract } from "@/types";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getSuggestedEndDate(endDate: string) {
  const [year, month, day] = endDate.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year + 1, month - 1, day))
    .toISOString()
    .slice(0, 10);
}

function getNextAllowedDate(endDate: string) {
  const [year, month, day] = endDate.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);
}

export function RenewalSuggestionCard({
  contract,
}: {
  contract: Contract & { daysUntilExpiration: number };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [endDate, setEndDate] = useState(
    contract.endDate ? getSuggestedEndDate(contract.endDate) : "",
  );
  const minEndDate = contract.endDate
    ? getNextAllowedDate(contract.endDate)
    : undefined;

  const handleRenew = async () => {
    if (!endDate) {
      toast.error("Vui lòng chọn ngày kết thúc mới");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/renew`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endDate: new Date(`${endDate}T23:59:59`).toISOString(),
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Không thể gia hạn hợp đồng");
        return;
      }

      toast.success("Đã gia hạn hợp đồng thành công");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-slate-800">
              Phòng {contract.room?.name} · {contract.tenant?.fullName}
            </p>
            <p className="text-sm text-slate-600">
              Hết hạn{" "}
              {contract.endDate
                ? new Date(contract.endDate).toLocaleDateString("vi-VN")
                : ""}
              {contract.room?.property?.name
                ? ` · ${contract.room.property.name}`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700"
          >
            {contract.daysUntilExpiration === 0
              ? "Hết hạn hôm nay"
              : `Còn ${contract.daysUntilExpiration} ngày`}
          </Badge>
          <Button
            className="min-h-10"
            onClick={() => setOpen(true)}
          >
            Gia hạn
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn hợp đồng</DialogTitle>
            <DialogDescription>
              Hợp đồng phòng {contract.room?.name} của{" "}
              {contract.tenant?.fullName}. Ngày kết thúc mới được đề xuất sau
              một năm; bạn có thể điều chỉnh trước khi xác nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor={`renew-end-date-${contract.id}`}>
              Ngày kết thúc mới
            </Label>
            <Input
              id={`renew-end-date-${contract.id}`}
              type="date"
              min={minEndDate}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Để sau
            </Button>
            <Button onClick={handleRenew} disabled={loading}>
              {loading ? "Đang gia hạn..." : "Xác nhận gia hạn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
