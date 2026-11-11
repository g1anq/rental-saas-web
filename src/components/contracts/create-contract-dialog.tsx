"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Room, Tenant } from "@/types";
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
import { fetchWithAuth } from "@/lib/auth-fetch";
import { toast } from "sonner";

interface CreateContractDialogProps {
  availableRooms: Room[];
  tenants: Tenant[];
}

export function CreateContractDialog({ availableRooms, tenants }: CreateContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [paymentCycle, setPaymentCycle] = useState("1");
  const [deposit, setDeposit] = useState("");
  const [electricityRate, setElectricityRate] = useState("3500");
  const [waterRate, setWaterRate] = useState("15000");
  const [customServices, setCustomServices] = useState<{name: string, amount: string, type: string, tiers?: {limit: number, price: number}[]}[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddService = () => {
    setCustomServices([...customServices, { name: "", amount: "", type: "PER_ROOM" }]);
  };

  const handleRemoveService = (index: number) => {
    setCustomServices(customServices.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: "name" | "amount" | "type", value: string) => {
    const newServices = [...customServices];
    newServices[index][field] = value;
    setCustomServices(newServices);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId,
          tenantId,
          startDate: new Date(startDate).toISOString(),
          ...(endDate && { endDate: new Date(endDate).toISOString() }),
          paymentCycle: Number(paymentCycle),
          deposit: Number(deposit),
          electricityRate: Number(electricityRate),
          waterRate: Number(waterRate),
          customServices: customServices.filter(s => s.name && (s.amount || s.tiers)).map(s => ({
            name: s.name,
            type: s.type,
            amount: s.amount ? Number(s.amount) : undefined,
            tiers: s.tiers,
          })),
          ...(notes && { notes }),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi tạo hợp đồng");
      }

      setOpen(false);

      // Reset form
      setRoomId("");
      setTenantId("");
      setEndDate("");
      setPaymentCycle("1");
      setDeposit("");
      setNotes("");
      setCustomServices([]);
      toast.success("Tạo hợp đồng thành công");
      router.refresh(); // Reload data
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
        <Plus className="w-4 h-4" />
        <span>Tạo hợp đồng</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo Hợp Đồng Thuê Phòng</DialogTitle>
          <DialogDescription>
            Thiết lập hợp đồng cho khách thuê. Phòng sẽ tự động chuyển sang trạng thái Đã Thuê.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roomId">Phòng (Chỉ phòng trống)</Label>
              <select
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Chọn phòng...</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {new Intl.NumberFormat("vi-VN").format(r.price)}đ
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantId">Khách thuê</Label>
              <select
                id="tenantId"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Chọn khách...</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} ({t.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc (Tùy chọn)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentCycle">Chu kỳ đóng tiền (tháng)</Label>
              <Input
                id="paymentCycle"
                type="number"
                min="1"
                placeholder="VD: 1"
                value={paymentCycle}
                onChange={(e) => setPaymentCycle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
              <Input
                id="deposit"
                type="number"
                placeholder="VD: 5000000"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="electricityRate">Giá điện (VNĐ/kWh)</Label>
              <Input
                id="electricityRate"
                type="number"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waterRate">Giá nước (VNĐ/m³)</Label>
              <Input
                id="waterRate"
                type="number"
                value={waterRate}
                onChange={(e) => setWaterRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>Dịch vụ thêm (Internet, Rác...)</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="h-8 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Thêm dịch vụ
              </Button>
            </div>
            {customServices.map((service, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder="Tên dịch vụ (VD: Internet)"
                  value={service.name}
                  onChange={(e) => handleServiceChange(idx, "name", e.target.value)}
                  className="flex-1"
                />
                <select
                  value={service.type}
                  onChange={(e) => handleServiceChange(idx, "type", e.target.value)}
                  className="w-[140px] flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="PER_ROOM">Theo phòng</option>
                  <option value="PER_PERSON">Theo người</option>
                  <option value="ELECTRICITY_TIERED">Điện bậc thang</option>
                  <option value="WATER_TIERED">Nước bậc thang</option>
                </select>
                {(service.type === "ELECTRICITY_TIERED" || service.type === "WATER_TIERED") ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newServices = [...customServices];
                      newServices[idx].tiers = [
                        { limit: 50, price: 3000 },
                        { limit: 100, price: 3500 },
                        { limit: 999999, price: 4000 }
                      ]; // Sample default tiers
                      setCustomServices(newServices);
                      toast.info("Đã tạo mẫu 3 bậc thang. Bạn có thể sửa JSON trong CSDL sau (Tính năng nâng cao).");
                    }}
                    className="w-[150px] text-xs h-9"
                  >
                    Tạo mẫu bậc thang
                  </Button>
                ) : (
                  <Input
                    type="number"
                    placeholder="Số tiền (VNĐ)"
                    value={service.amount}
                    onChange={(e) => handleServiceChange(idx, "amount", e.target.value)}
                    className="w-[150px]"
                  />
                )}
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveService(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="notes">Ghi chú (Tùy chọn)</Label>
            <Input
              id="notes"
              placeholder="VD: Đã bao gồm nội thất cơ bản"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Hoàn tất tạo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
