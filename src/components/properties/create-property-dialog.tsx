"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Loader2 } from "lucide-react";
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

export function CreatePropertyDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, description: description || undefined }),
      });

      if (!res.ok) throw new Error("Lỗi khi thêm khu trọ");

      setOpen(false);
      toast.success("Đã thêm khu trọ thành công");
      setName("");
      setAddress("");
      setDescription("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40">
        <Building className="w-4 h-4" />
        <span>Thêm Khu Trọ</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Khu Trọ Mới</DialogTitle>
          <DialogDescription>Tạo khu nhà mới để quản lý các phòng trọ bên trong.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Tên khu trọ</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Khu trọ Sinh viên A" />
          </div>

          <div className="space-y-2">
            <Label>Địa chỉ</Label>
            <Input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="VD: 123 Đường B, Quận C" />
          </div>

          <div className="space-y-2">
            <Label>Mô tả (Tùy chọn)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ghi chú thêm về khu trọ này..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
