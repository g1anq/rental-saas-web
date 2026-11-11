"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mailbox, Loader2 } from "lucide-react";
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

export function BulkSendRemindersDialog() {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/invoices/send-reminders/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: Number(month),
          year: Number(year),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi gửi email nhắc nợ");
      }

      const result = await res.json();

      setOpen(false);
      toast.success(result.message || "Đã gửi email nhắc nợ!");
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
      <DialogTrigger className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors shadow-sm border">
        <Mailbox className="w-4 h-4" />
        <span className="hidden sm:inline">Nhắc nợ hàng loạt</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gửi Email Nhắc Nợ</DialogTitle>
          <DialogDescription>
            Hệ thống sẽ tự động gửi email nhắc thanh toán hóa đơn đến tất cả khách thuê CÒN NỢ trong tháng/năm bạn chọn.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="remind-month">Tháng nợ</Label>
              <Input
                id="remind-month"
                type="number"
                min={1} max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remind-year">Năm</Label>
              <Input
                id="remind-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mailbox className="w-4 h-4" />}
              {loading ? "Đang gửi..." : "Gửi Email Ngay"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
