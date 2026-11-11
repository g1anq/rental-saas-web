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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TenantCreateMaintenanceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
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
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Đã gửi yêu cầu sửa chữa thành công!");
        setOpen(false);
        router.refresh();
        setFormData({ title: "", description: "", priority: "MEDIUM", imageUrl: "" });
      } else {
        const data = await res.json();
        toast.error(data.message || "Không thể gửi yêu cầu");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto">
        <Plus className="w-4 h-4" /> Báo cáo sự cố
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[92vh] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Báo cáo sự cố / Yêu cầu sửa chữa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tiêu đề (Tóm tắt sự cố)</Label>
            <Input
              required
              placeholder="VD: Bóng đèn nhà tắm bị hỏng"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Chi tiết sự cố</Label>
            <Textarea
              required
              placeholder="Mô tả chi tiết tình trạng hiện tại để chủ trọ nắm rõ..."
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Mức độ nghiêm trọng</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="LOW">Thấp (Không gấp)</option>
              <option value="MEDIUM">Vừa (Cần sửa sớm)</option>
              <option value="HIGH">Cao (Ảnh hưởng sinh hoạt)</option>
              <option value="URGENT">Khẩn cấp (Nguy hiểm / Mất điện nước)</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Ảnh minh chứng (Tùy chọn)</Label>
            <Input
              type="file"
              accept="image/*"
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
