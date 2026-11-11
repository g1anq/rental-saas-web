"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CopyPlus } from "lucide-react";
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

export function BulkCreateInvoiceDialog() {
  const [open, setOpen] = useState(false);
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
          otherAmount: Number(otherAmount),
          ...(notes && { notes }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi tạo hóa đơn hàng loạt");
      }

      const result = await res.json();

      setOpen(false);
      setOtherAmount("0");
      setNotes("");
      toast.success(result.message || "Đã xử lý tạo hóa đơn hàng loạt!");
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
      <DialogTrigger className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm">
        <CopyPlus className="w-4 h-4" />
        <span>Tạo hàng loạt</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo Hóa Đơn Hàng Loạt</DialogTitle>
          <DialogDescription>
            Tự động tạo hóa đơn cho tất cả các hợp đồng đang hiệu lực. Sẽ tự động tính toán điện/nước nếu đã ghi chỉ số, nếu chưa ghi sẽ chỉ tính tiền phòng. Hóa đơn đã tồn tại sẽ bị bỏ qua.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-month">Tháng</Label>
              <Input
                id="bulk-month"
                type="number"
                min={1} max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-year">Năm</Label>
              <Input
                id="bulk-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-otherAmount">Phụ thu khác (Gửi xe, rác...) VNĐ</Label>
            <Input
              id="bulk-otherAmount"
              type="number"
              value={otherAmount}
              onChange={(e) => setOtherAmount(e.target.value)}
              required
            />
            <p className="text-[11px] text-muted-foreground">Khoản phụ thu này sẽ áp dụng cho TẤT CẢ hóa đơn được tạo.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-notes">Ghi chú phụ thu</Label>
            <Input
              id="bulk-notes"
              placeholder="VD: Phụ thu rác đồng giá"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Bắt đầu tạo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
