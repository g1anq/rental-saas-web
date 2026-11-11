"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/lib/auth-fetch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TenantSubmitUtilityDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear,
    electricityCurr: "",
    waterCurr: "",
    imageUrl: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Vui lòng chọn ảnh nhỏ hơn 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/utility-readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number(formData.month),
          year: Number(formData.year),
          electricityCurr: Number(formData.electricityCurr),
          waterCurr: Number(formData.waterCurr),
          imageUrl: formData.imageUrl
        }),
      });

      if (res.ok) {
        toast.success("Đã nộp chỉ số điện nước thành công!");
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Không thể nộp chỉ số");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto">
        <Zap className="w-4 h-4" /> Chốt số điện nước
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[92vh] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ghi số Điện / Nước tháng {currentMonth}/{currentYear}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tháng</Label>
              <Input type="number" min="1" max="12" value={formData.month} onChange={e => setFormData(p => ({...p, month: Number(e.target.value)}))} required />
            </div>
            <div className="space-y-2">
              <Label>Năm</Label>
              <Input type="number" min="2020" value={formData.year} onChange={e => setFormData(p => ({...p, year: Number(e.target.value)}))} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Chỉ số Điện Mới (Số trên công tơ)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 flex h-5 w-5 items-center justify-center text-slate-400 font-bold">⚡</span>
              <Input
                type="number"
                min="0"
                step="0.1"
                required
                placeholder="VD: 2450"
                className="pl-10"
                value={formData.electricityCurr}
                onChange={(e) => setFormData(prev => ({ ...prev, electricityCurr: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Chỉ số Nước Mới (Số trên đồng hồ nước)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 flex h-5 w-5 items-center justify-center text-slate-400 font-bold">💧</span>
              <Input
                type="number"
                min="0"
                step="0.1"
                required
                placeholder="VD: 145"
                className="pl-10"
                value={formData.waterCurr}
                onChange={(e) => setFormData(prev => ({ ...prev, waterCurr: e.target.value }))}
              />
            </div>
            <p className="text-xs text-muted-foreground">Nếu phòng bạn tính nước theo người, hãy điền số lượng người thực tế đang ở tháng này.</p>
          </div>

          <div className="space-y-2">
            <Label>Ảnh chụp công tơ / đồng hồ nước</Label>
            <Input
              type="file"
              accept="image/*"
              required // Bắt buộc phải có minh chứng
              onChange={handleImageChange}
              className="file:text-slate-600 file:bg-slate-100 hover:file:bg-slate-200 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-full"
            />
            {formData.imageUrl && (
              <div className="mt-2 relative w-full h-32 rounded-md overflow-hidden border border-slate-200">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, imageUrl: ""}))}
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-rose-500 hover:bg-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nộp thông tin
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
