"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { toast } from "sonner";
import { Property } from "@/types";

export function UpdatePropertyDialog({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(property.name);
  const [address, setAddress] = useState(property.address);
  const [description, setDescription] = useState(property.description || "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, description: description || null }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật khu trọ");

      setOpen(false);
      toast.success("Đã cập nhật khu trọ");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Bạn có chắc chắn muốn xóa khu trọ "${property.name}"? Chú ý: Việc này có thể thất bại nếu vẫn còn phòng thuộc khu trọ này.`)) return;
    setDeleting(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties/${property.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa khu trọ (Hãy đảm bảo không còn phòng nào trong khu này)");

      setOpen(false);
      toast.success("Đã xóa khu trọ");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white hover:bg-slate-100 hover:text-primary h-8 w-8 p-0 text-slate-500 shadow-sm border border-slate-200">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa Khu Trọ</DialogTitle>
          <DialogDescription>Cập nhật thông tin chi tiết của khu nhà.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tên khu trọ</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Địa chỉ</Label>
            <Input required value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Mô tả (Tùy chọn)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={deleting || loading} title="Xóa khu trọ">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={loading || deleting} className="min-w-[100px]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
