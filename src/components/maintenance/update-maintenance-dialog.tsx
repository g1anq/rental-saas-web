"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { MaintenancePriority, MaintenanceRequest, MaintenanceStatus } from "@/types";
import { toast } from "sonner";

export function UpdateMaintenanceDialog({ request }: { request: MaintenanceRequest }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [status, setStatus] = useState(request.status);
  const [priority, setPriority] = useState(request.priority);
  const [cost, setCost] = useState(request.cost?.toString() || "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/maintenance/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          cost: cost ? Number(cost) : undefined
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật");

      setOpen(false);
      toast.success("Đã cập nhật yêu cầu bảo trì");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  }

  const isRoommateReq = request.title.startsWith("Yêu cầu");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-8 w-8 p-0 text-slate-500 hover:text-primary">
        <Edit className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isRoommateReq ? 'Cập nhật yêu cầu' : 'Cập nhật bảo trì'}</DialogTitle>
          <DialogDescription>{isRoommateReq ? 'Nội dung' : 'Sự cố'}: {request.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select value={status} onValueChange={(val) => val && setStatus(val as MaintenanceStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="IN_PROGRESS">Đang sửa</SelectItem>
                <SelectItem value="COMPLETED">Đã xong</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Độ ưu tiên</Label>
            <Select value={priority} onValueChange={(val) => val && setPriority(val as MaintenancePriority)}>
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

          {!isRoommateReq && (
            <div className="space-y-2">
              <Label>Chi phí sửa chữa (VNĐ)</Label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="VD: 150000"
              />
              <p className="text-xs text-muted-foreground">Nhập khi đã sửa xong nếu có phát sinh chi phí.</p>
            </div>
          )}

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
