"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Loader2, Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Room } from "@/types";
import { toast } from "sonner";

export function CreateMaintenanceDialog({ rooms }: { rooms: Room[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [roomId, setRoomId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roomId) {
      toast.error("Vui lòng chọn phòng");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, title, description, priority }),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo yêu cầu bảo trì");

      setOpen(false);
      toast.success("Tạo yêu cầu bảo trì thành công");
      setTitle("");
      setDescription("");
      setRoomId("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40">
        <Plus className="w-4 h-4" />
        <span>Thêm Yêu cầu</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo yêu cầu bảo trì / sửa chữa</DialogTitle>
          <DialogDescription>Ghi nhận sự cố thiết bị hoặc phòng trọ cần xử lý.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Phòng bị sự cố <span className="text-red-500">*</span></Label>
            <Select value={roomId} onValueChange={(val: any) => setRoomId(val || "")}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng..." />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tiêu đề sự cố <span className="text-red-500">*</span></Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Ống nước bị rỉ..." />
          </div>

          <div className="space-y-2">
            <Label>Độ ưu tiên</Label>
            <Select value={priority} onValueChange={(val: any) => setPriority(val || "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Thấp</SelectItem>
                <SelectItem value="MEDIUM">Vừa</SelectItem>
                <SelectItem value="HIGH">Cao</SelectItem>
                <SelectItem value="URGENT">Khẩn cấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mô tả chi tiết</Label>
            <Textarea value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Ghi chú thêm về sự cố..." />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
