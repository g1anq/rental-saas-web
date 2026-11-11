"use client";

import { useState, useEffect } from "react";
import { Contract } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog as Sheet,
  DialogContent as SheetContent,
  DialogDescription as SheetDescription,
  DialogHeader as SheetHeader,
  DialogTitle as SheetTitle,
  DialogTrigger as SheetTrigger,
} from "@/components/ui/dialog";
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
import { CalendarClock, Ban, User, Phone, CreditCard, Mail, Home, BadgeCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { Badge } from "@/components/ui/badge";

export function ContractDetailsSheet({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"RENEW" | "TERMINATE" | "ADD_ROOMMATE" | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Trạng thái cho Thanh lý
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionReason, setDeductionReason] = useState("");
  const [finalElectricity, setFinalElectricity] = useState("");
  const [finalWater, setFinalWater] = useState("");

  const [endDate, setEndDate] = useState(contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "");

  // Trạng thái cho Thêm người ở ghép
  const [rmName, setRmName] = useState("");
  const [rmCccd, setRmCccd] = useState("");
  const [rmPhone, setRmPhone] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  useEffect(() => {
    if (isSheetOpen) {
      fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/roommate-requests`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPendingRequests(data.filter(d => d.title.includes("thêm") && d.status !== 'COMPLETED' && d.status !== 'CANCELLED'));
          }
        })
        .catch(console.error);
    }
  }, [isSheetOpen, contract.id]);

  const handleAddRoommate = async () => {
    if (!rmName || !rmCccd || !rmPhone) {
      toast.error("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/roommates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: rmName,
          cccd: rmCccd,
          phone: rmPhone,
        }),
      });
      if (res.ok) {
        toast.success("Đã thêm người ở ghép!");
        setActionType(null);
        setRmName("");
        setRmCccd("");
        setRmPhone("");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi thêm người ở ghép");
      }
    } catch (e) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  const handleTerminate = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/terminate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deductionAmount: Number(deductionAmount),
          deductionReason,
          finalElectricity: Number(finalElectricity),
          finalWater: Number(finalWater)
        })
      });
      if (res.ok) {
        toast.success("Đã kết thúc hợp đồng thành công!");
        setActionType(null);
        setIsSheetOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi kết thúc hợp đồng");
      }
    } catch (e) {
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
        setIsSheetOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi gia hạn");
      }
    } catch (e) {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRoommate = async (tenantId: string) => {
    if (!confirm("Xóa thành viên ở ghép này khỏi hợp đồng?")) return;

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${contract.id}/roommates/${tenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa người ở ghép!");
        router.refresh();
      } else {
        toast.error("Lỗi khi xóa người ở ghép");
      }
    } catch (e) {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger className="h-8 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none">
          Chi tiết
        </SheetTrigger>
        <SheetContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh] w-full">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-xl text-slate-800">
              <FileText className="w-5 h-5 text-indigo-600" />
              Chi tiết Hợp đồng
            </SheetTitle>
            <SheetDescription>
              Xem thông tin chi tiết và quản lý hợp đồng thuê.
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Trạng thái */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
              <span className="font-medium text-slate-600">Trạng thái</span>
              <Badge
                variant={contract.isActive ? "default" : "secondary"}
                className={contract.isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}
              >
                {contract.isActive ? "Đang hiệu lực" : "Đã kết thúc"}
              </Badge>
            </div>

            {/* Thông tin phòng */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Home className="w-4 h-4 text-slate-500" /> Thông tin Phòng
              </h4>
              <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Tên phòng:</span>
                  <span className="font-medium text-slate-800">{contract.room?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền cọc:</span>
                  <span className="font-medium text-slate-800">{formatter.format(contract.deposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chu kỳ thanh toán:</span>
                  <span className="font-medium text-slate-800">
                    {(contract as any).paymentCycle ? `${(contract as any).paymentCycle} tháng/lần` : "1 tháng/lần"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Giá điện:</span>
                  <span className="font-medium text-slate-800">{formatter.format(contract.electricityRate)}/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá nước:</span>
                  <span className="font-medium text-slate-800">{formatter.format(contract.waterRate)}/khối</span>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t">
                  <span>Bắt đầu:</span>
                  <span className="font-medium text-slate-800">{new Date(contract.startDate).toLocaleDateString('vi-VN')}</span>
                </div>
                {contract.endDate && (
                  <div className="flex justify-between">
                    <span>Kết thúc:</span>
                    <span className="font-medium text-slate-800">{new Date(contract.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin khách thuê */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" /> Thông tin Khách thuê
              </h4>
              <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  <strong className="font-medium text-slate-800 text-base">{contract.tenant?.fullName}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <span>CCCD: {contract.tenant?.cccd}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>SĐT: {contract.tenant?.phone}</span>
                </div>
                {contract.tenant?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Email: {contract.tenant?.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin người ở ghép */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> Thành viên ở ghép
                </h4>
                {contract.isActive && (
                  <Button variant="outline" size="sm" onClick={() => setActionType("ADD_ROOMMATE")} className="h-7 text-xs">
                    + Thêm người
                  </Button>
                )}
              </div>
              <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3 text-sm text-slate-600">
                {(!contract.roommates || contract.roommates.length === 0) ? (
                  <p className="text-center text-slate-400 italic py-2">Chưa có người ở ghép nào.</p>
                ) : (
                  <div className="space-y-3 divide-y divide-slate-100">
                    {contract.roommates.map(rm => (
                      <div key={rm.id} className="pt-3 first:pt-0 flex items-center justify-between">
                        <div>
                          <strong className="font-medium text-slate-800">{rm.fullName}</strong>
                          <p className="text-xs text-slate-500 mt-0.5">CCCD: {rm.cccd} - SĐT: {rm.phone}</p>
                        </div>
                        {contract.isActive && (
                          <Button variant="ghost" size="sm" className="h-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleRemoveRoommate(rm.id)}>
                            Xóa
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Hành động */}
            {contract.isActive && (
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-semibold text-slate-800">Thao tác</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setActionType("RENEW")}>
                    <CalendarClock className="w-4 h-4 mr-2" /> Gia hạn
                  </Button>
                  <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setActionType("TERMINATE")}>
                    <Ban className="w-4 h-4 mr-2" /> Thanh lý / Đổi người
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog Gia Hạn */}
      <Dialog open={actionType === "RENEW"} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent className="z-[100]">
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

      {/* Dialog Kết Thúc / Thanh Lý */}
      <Dialog open={actionType === "TERMINATE"} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent className="z-[100] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600">Thủ tục Thanh lý Hợp đồng</DialogTitle>
            <DialogDescription>
              Kết thúc hợp đồng phòng <b>{contract.room?.name}</b>. Hệ thống sẽ tự động chuyển trạng thái phòng thành <b>Phòng Trống</b>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-700">
              <div className="flex justify-between mb-1">
                <span>Tiền cọc ban đầu:</span>
                <span className="font-semibold">{formatter.format(contract.deposit)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chỉ số điện cuối</Label>
                <Input
                  type="number"
                  placeholder="Chỉ số điện"
                  value={finalElectricity}
                  onChange={(e) => setFinalElectricity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Chỉ số nước cuối</Label>
                <Input
                  type="number"
                  placeholder="Chỉ số nước"
                  value={finalWater}
                  onChange={(e) => setFinalWater(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trừ tiền cọc (do hư hỏng tài sản...)</Label>
              <Input
                type="number"
                placeholder="VD: 500000"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Lý do trừ tiền</Label>
              <Input
                placeholder="VD: Hỏng ổ khóa cửa"
                value={deductionReason}
                onChange={(e) => setDeductionReason(e.target.value)}
              />
            </div>

            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-sm text-emerald-800">
              <div className="flex justify-between font-semibold">
                <span>Số tiền cọc hoàn trả dự kiến:</span>
                <span>{formatter.format(Math.max(0, contract.deposit - Number(deductionAmount || 0)))}</span>
              </div>
              <p className="text-xs mt-1 text-emerald-600 italic">
                * Chưa bao gồm tiền điện nước tháng cuối tính theo chỉ số trên.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} disabled={loading}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleTerminate} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận Thanh lý"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Thêm Người Ở Ghép */}
      <Dialog open={actionType === "ADD_ROOMMATE"} onOpenChange={(o) => !o && setActionType(null)}>
        <DialogContent className="z-[100]">
          <DialogHeader>
            <DialogTitle>Thêm Người Ở Ghép</DialogTitle>
            <DialogDescription>
              Người ở ghép sẽ được liên kết trực tiếp vào hợp đồng hiện tại.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {pendingRequests.length > 0 && (
              <div className="mb-4 space-y-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <Label className="text-indigo-800 font-semibold flex items-center gap-1">
                  <User className="w-4 h-4" /> Yêu cầu từ khách thuê:
                </Label>
                {pendingRequests.map(req => {
                  // extract data from description: "Họ tên: Nguyen A\nCCCD: ...\nSĐT: ..."
                  const nameMatch = req.description?.match(/Họ tên: (.*)/);
                  const cccdMatch = req.description?.match(/CCCD: (.*)/);
                  const phoneMatch = req.description?.match(/SĐT: (.*)/);

                  const pName = nameMatch ? nameMatch[1] : "";
                  const pCccd = (cccdMatch && cccdMatch[1] !== 'Không có') ? cccdMatch[1] : "";
                  const pPhone = (phoneMatch && phoneMatch[1] !== 'Không có') ? phoneMatch[1] : "";

                  return (
                    <div key={req.id} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                      <div>
                        <div className="font-medium text-slate-800">{pName}</div>
                        <div className="text-xs text-slate-500">SĐT: {pPhone} - CCCD: {pCccd}</div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs bg-indigo-50 text-indigo-700" onClick={() => {
                        setRmName(pName);
                        setRmCccd(pCccd);
                        setRmPhone(pPhone);
                        // Also mark the request as completed implicitly if we want, but for now just populate
                      }}>
                        Điền thông tin
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="space-y-2">
              <Label>Họ và tên *</Label>
              <Input
                value={rmName}
                onChange={(e) => setRmName(e.target.value)}
                placeholder="VD: Nguyễn Văn B"
              />
            </div>
            <div className="space-y-2">
              <Label>Số CCCD *</Label>
              <Input
                value={rmCccd}
                onChange={(e) => setRmCccd(e.target.value)}
                placeholder="VD: 079201000111"
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại *</Label>
              <Input
                value={rmPhone}
                onChange={(e) => setRmPhone(e.target.value)}
                placeholder="VD: 0912345678"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)} disabled={loading}>
              Hủy
            </Button>
            <Button onClick={handleAddRoommate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? "Đang lưu..." : "Lưu thành viên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
