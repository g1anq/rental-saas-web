"use client";

import { useState } from "react";
import { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, CalendarClock, Ban } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth-fetch";

export function ContractActions({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"RENEW" | "TERMINATE" | null>(null);

  const [endDate, setEndDate] = useState(contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "");

  const handleTerminate = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/terminate`, {
        method: "PATCH",
      });
      if (res.ok) {
        toast.success("Đã kết thúc hợp đồng thành công!");
        setActionType(null);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi kết thúc hợp đồng");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!endDate) {
      toast.error("Vui lòng chọn ngày kết thúc mới");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endDate: new Date(endDate).toISOString(),
        }),
      });
      if (res.ok) {
        toast.success("Đã gia hạn hợp đồng thành công!");
        setActionType(null);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi gia hạn");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (!contract.isActive) {
    return (
      <span className="text-xs font-medium text-slate-400 italic">
        Không có hành động
      </span>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none">
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4 text-slate-600" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Tùy chọn Hợp đồng</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setActionType("RENEW")} className="cursor-pointer">
              <CalendarClock className="mr-2 h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-600">Gia hạn hợp đồng</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActionType("TERMINATE")} className="cursor-pointer focus:bg-rose-50">
              <Ban className="mr-2 h-4 w-4 text-rose-600" />
              <span className="font-medium text-rose-600">Kết thúc hợp đồng</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Gia Hạn */}
      <Dialog open={actionType === "RENEW"} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn Hợp đồng</DialogTitle>
            <DialogDescription>
              Cập nhật ngày kết thúc mới cho hợp đồng phòng <b>{contract.room?.name}</b> của <b>{contract.tenant?.fullName}</b>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Ngày kết thúc mới</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleRenew} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Đang xử lý..." : "Xác nhận gia hạn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Kết Thúc */}
      <Dialog open={actionType === "TERMINATE"} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-600">Xác nhận kết thúc Hợp đồng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn kết thúc hợp đồng phòng <b>{contract.room?.name}</b>?
              <br/><br/>
              Hành động này sẽ:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-700 font-medium">
                <li>Đánh dấu hợp đồng này là <span className="text-rose-500">Đã kết thúc</span>.</li>
                <li>Chuyển trạng thái phòng thành <span className="text-emerald-500">Phòng Trống</span>.</li>
              </ul>
              <br/>
              Không thể hoàn tác thao tác này!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setActionType(null)} disabled={loading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={loading}>
              {loading ? "Đang xử lý..." : "Chấm dứt hợp đồng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
