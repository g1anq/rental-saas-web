"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Contract } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { toast } from "sonner";

export function CreateInvoiceDialog({ activeContracts }: { activeContracts: Contract[] }) {
  const [open, setOpen] = useState(false);
  const [contractId, setContractId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [otherAmount, setOtherAmount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          month: Number(month),
          year: Number(year),
          otherAmount: Number(otherAmount),
          ...(notes && { notes }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi tạo hóa đơn");
      }

      setOpen(false);
      setContractId("");
      setOtherAmount("0");
      setNotes("");
      toast.success("Tạo hóa đơn thành công");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
        <Plus className="w-4 h-4" />
        <span>Tạo hóa đơn</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tính Tiền & Tạo Hóa Đơn</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động tính toán tiền phòng, điện, nước (dựa trên chỉ số đã ghi).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="contractId">Hợp đồng / Phòng</Label>
            <select
              id="contractId"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled>Chọn hợp đồng...</option>
              {activeContracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.room?.name} - Khách: {c.tenant?.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Tháng</Label>
              <Input
                id="month"
                type="number"
                min={1} max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Năm</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherAmount">Phụ thu khác (Gửi xe, rác...) VNĐ</Label>
            <Input
              id="otherAmount"
              type="number"
              value={otherAmount}
              onChange={(e) => setOtherAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú phụ thu</Label>
            <Input
              id="notes"
              placeholder="VD: Phí đổ rác tháng 10"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo hóa đơn"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
