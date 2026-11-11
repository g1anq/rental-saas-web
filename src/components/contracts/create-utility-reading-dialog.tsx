"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export function CreateUtilityReadingDialog({ contractId }: { contractId: string }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [electricityPrev, setElectricityPrev] = useState("");
  const [electricityCurr, setElectricityCurr] = useState("");
  const [waterPrev, setWaterPrev] = useState("");
  const [waterCurr, setWaterCurr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      // Fetch latest utility readings
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contractId}/utility-readings`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const latest = data[0]; // Ordered by date desc
            setElectricityPrev(latest.electricityCurr.toString());
            setWaterPrev(latest.waterCurr.toString());

            // Set next month
            let nextMonth = latest.month + 1;
            let nextYear = latest.year;
            if (nextMonth > 12) {
              nextMonth = 1;
              nextYear += 1;
            }
            setMonth(nextMonth);
            setYear(nextYear);
          }
        })
        .catch(console.error);
    } else {
      // reset form
      setElectricityCurr("");
      setWaterCurr("");
    }
  }, [open, contractId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/utility-readings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractId,
          month: Number(month),
          year: Number(year),
          electricityPrev: Number(electricityPrev),
          electricityCurr: Number(electricityCurr),
          waterPrev: Number(waterPrev),
          waterCurr: Number(waterCurr),
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi ghi chỉ số");

      setOpen(false);
      toast.success("Ghi chỉ số thành công");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-indigo-600 hover:text-indigo-900 font-medium text-sm border border-indigo-200 px-2 py-1 rounded">
        Ghi chỉ số Đ/N
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ghi chỉ số Điện Nước</DialogTitle>
          <DialogDescription>
            Nhập chỉ số điện và nước cho tháng hiện tại.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="e-prev">Điện cũ (kWh)</Label>
              <Input
                id="e-prev"
                type="number"
                value={electricityPrev}
                onChange={(e) => setElectricityPrev(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-curr">Điện mới (kWh)</Label>
              <Input
                id="e-curr"
                type="number"
                value={electricityCurr}
                onChange={(e) => setElectricityCurr(e.target.value)}
                required
              />
              {electricityPrev && electricityCurr && Number(electricityCurr) >= Number(electricityPrev) && (
                <div className="text-xs text-emerald-600 font-medium">Tiêu thụ: {Number(electricityCurr) - Number(electricityPrev)} kWh</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="w-prev">Nước cũ (m³)</Label>
              <Input
                id="w-prev"
                type="number"
                value={waterPrev}
                onChange={(e) => setWaterPrev(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="w-curr">Nước mới (m³)</Label>
              <Input
                id="w-curr"
                type="number"
                value={waterCurr}
                onChange={(e) => setWaterCurr(e.target.value)}
                required
              />
              {waterPrev && waterCurr && Number(waterCurr) >= Number(waterPrev) && (
                <div className="text-xs text-emerald-600 font-medium">Tiêu thụ: {Number(waterCurr) - Number(waterPrev)} m³</div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
