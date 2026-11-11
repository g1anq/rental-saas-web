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
import { Switch } from "@/components/ui/switch";
import { Notice } from "@/types";

export function UpdateNoticeDialog({ notice, rooms = [], properties = [] }: { notice: Notice, rooms?: any[], properties?: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState(notice.title);
  const [content, setContent] = useState(notice.content);
  const [isImportant, setIsImportant] = useState(notice.isImportant);
  const [propertyId, setPropertyId] = useState(notice.propertyId || (notice.roomId ? rooms.find(r => r.id === notice.roomId)?.propertyId : "all") || "all");
  const [roomId, setRoomId] = useState(notice.roomId || "all");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/notices/${notice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          isImportant,
          roomId: propertyId !== "all" && roomId !== "all" ? roomId : null,
          propertyId: propertyId !== "all" ? propertyId : null,
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật thông báo");

      setOpen(false);
      toast.success("Đã cập nhật thông báo");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
    setDeleting(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/notices/${notice.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi khi xóa thông báo");

      setOpen(false);
      toast.success("Đã xóa thông báo");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-100 hover:text-primary h-8 w-8 p-0 text-slate-400">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa Thông Báo</DialogTitle>
          <DialogDescription>Chỉnh sửa thông báo hoặc thay đổi người nhận.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Khu trọ nhận thông báo</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={propertyId}
              onChange={(e) => {
                setPropertyId(e.target.value);
                setRoomId("all");
              }}
            >
              <option value="all">Gửi toàn bộ hệ thống (Tất cả khu trọ)</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {propertyId !== "all" && (
            <div className="space-y-2">
              <Label>Phòng nhận thông báo</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                <option value="all">Gửi tất cả phòng thuộc khu trọ này</option>
                {rooms.filter(r => r.propertyId === propertyId).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Nội dung</Label>
            <Textarea required value={content} onChange={(e: any) => setContent(e.target.value)} rows={4} />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch id="important-mode-edit" checked={isImportant} onCheckedChange={setIsImportant} />
            <Label htmlFor="important-mode-edit" className="text-rose-600 font-medium">Đánh dấu Quan Trọng (Khẩn cấp)</Label>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="destructive" size="icon" onClick={handleDelete} disabled={deleting || loading} title="Xóa thông báo">
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
