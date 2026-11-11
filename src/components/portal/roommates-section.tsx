"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, X } from "lucide-react";
import { Tenant } from "@/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/auth-fetch";

export function RoommatesSection({ roommates }: { roommates: Tenant[] }) {
  const [requestType, setRequestType] = useState<"ADD" | "REMOVE" | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetName, setTargetName] = useState("");
  const [targetCccd, setTargetCccd] = useState("");
  const [targetPhone, setTargetPhone] = useState("");

  const handleRequest = async () => {
    if (!targetName.trim()) {
      toast.error("Vui lòng nhập họ tên người ở ghép");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/roommates/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          fullName: targetName,
          cccd: targetCccd,
          phone: targetPhone
        })
      });

      if (res.ok) {
        toast.success(`Yêu cầu ${requestType === 'ADD' ? 'thêm' : 'xóa'} người ở ghép đã được gửi tới Chủ trọ.`);
        setRequestType(null);
        setTargetName("");
        setTargetCccd("");
        setTargetPhone("");
      } else {
        const err = await res.json();
        toast.error(err.message || "Không thể gửi yêu cầu");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const openRemoveDialog = (rm: Tenant) => {
    setTargetName(rm.fullName);
    setTargetCccd(rm.cccd || "");
    setTargetPhone(rm.phone || "");
    setRequestType("REMOVE");
  };

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white/70 backdrop-blur-md">
      <CardHeader className="flex flex-col items-stretch justify-between gap-3 border-b bg-slate-50/50 pb-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-indigo-500" />
            Thành viên ở ghép
          </CardTitle>
          <CardDescription>Danh sách người ở cùng (không bao gồm bạn)</CardDescription>
        </div>
        <Button className="min-h-11 w-full sm:w-auto" variant="outline" size="sm" onClick={() => {
          setTargetName(""); setTargetCccd(""); setTargetPhone(""); setRequestType("ADD");
        }}>
          <Plus className="w-4 h-4 mr-1" /> Gửi Y/C Thêm
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {(!roommates || roommates.length === 0) ? (
          <div className="p-6 text-center text-sm text-slate-500">
            Chưa có thành viên ở ghép nào được đăng ký.
          </div>
        ) : (
          <div className="divide-y">
            {roommates.map((rm) => (
              <div key={rm.id} className="flex flex-col items-start justify-between gap-3 p-4 transition-colors hover:bg-slate-50/50 min-[480px]:flex-row min-[480px]:items-center">
                <div className="min-w-0">
                  <div className="font-medium text-slate-800">{rm.fullName}</div>
                  <div className="break-all text-sm text-slate-500">SĐT: {rm.phone || 'Chưa có'} - CCCD: {rm.cccd}</div>
                </div>
                <Button variant="ghost" size="sm" className="min-h-11 text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => openRemoveDialog(rm)}>
                  <X className="w-4 h-4 mr-1" /> Y/C Xóa
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!requestType} onOpenChange={(o) => !o && setRequestType(null)}>
        <DialogContent className="max-h-[calc(100dvh-1rem)] overflow-y-auto sm:max-h-[92vh]">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu {requestType === 'ADD' ? 'thêm' : 'xóa'} thành viên</DialogTitle>
            <DialogDescription>
              Yêu cầu này sẽ được gửi đến Bảng điều khiển của Chủ trọ để phê duyệt và cập nhật danh sách tạm trú.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Họ và tên *</Label>
              <Input value={targetName} onChange={e => setTargetName(e.target.value)} disabled={requestType === 'REMOVE'} />
            </div>
            <div className="space-y-2">
              <Label>CCCD</Label>
              <Input value={targetCccd} onChange={e => setTargetCccd(e.target.value)} disabled={requestType === 'REMOVE'} />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input value={targetPhone} onChange={e => setTargetPhone(e.target.value)} disabled={requestType === 'REMOVE'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestType(null)} disabled={loading}>Hủy</Button>
            <Button onClick={handleRequest} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
