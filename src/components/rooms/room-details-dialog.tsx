"use client";

import { useState } from "react";
import { Property, Room } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, PencilLine, Trash2, Loader2, Info, Plus, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/auth-fetch";

export function RoomDetailsDialog({ room, properties = [] }: { room: Room, properties?: Property[] }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: room.name,
    price: room.price.toString(),
    area: room.area?.toString() || "",
    maxCapacity: room.maxCapacity?.toString() || "",
    status: room.status,
    propertyId: room.propertyId || "",
  });

  const [assets, setAssets] = useState<{ name: string; quantity: number; status: string }[]>(
    room.assets || []
  );

  const addAsset = () => {
    setAssets([...assets, { name: "", quantity: 1, status: "Tốt" }]);
  };

  const removeAsset = (index: number) => {
    setAssets(assets.filter((_, i) => i !== index));
  };

  const updateAsset = (index: number, field: string, value: string | number) => {
    const newAssets = [...assets];
    newAssets[index] = { ...newAssets[index], [field]: value };
    setAssets(newAssets);
  };

  const formatter = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

  const handleUpdate = async () => {
    if (!formData.name || !formData.price) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          area: formData.area ? Number(formData.area) : null,
          maxCapacity: formData.maxCapacity ? Number(formData.maxCapacity) : null,
          status: formData.status,
          assets: assets,
          propertyId: formData.propertyId || null,
        }),
      });

      if (res.ok) {
        toast.success("Đã cập nhật thông tin phòng");
        setIsEditing(false);
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Lỗi khi cập nhật");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors outline-none">
        Chi tiết
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[90vh]">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <Home className="w-6 h-6 text-indigo-600" />
            Chi tiết Phòng trọ
          </DialogTitle>
          <DialogDescription>
            Quản lý thông tin và trạng thái của phòng.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tên phòng</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Phòng 101"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá thuê (VNĐ/tháng)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="VD: 3000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diện tích (m²)</Label>
                  <Input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="VD: 25"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sức chứa tối đa (người)</Label>
                <Input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  placeholder="VD: 3"
                />
              </div>
              <div className="space-y-2">
                <Label>Thuộc khu trọ</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                >
                  <option value="">Không thuộc khu nào</option>
                  {properties?.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => val && setFormData({ ...formData, status: val as Room["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Phòng trống</SelectItem>
                    <SelectItem value="RENTED" disabled>Đã thuê (Tự động cập nhật)</SelectItem>
                    <SelectItem value="MAINTENANCE">Đang bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label>Tài sản trong phòng</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAsset} className="h-8">
                    <Plus className="w-3 h-3 mr-1" /> Thêm tài sản
                  </Button>
                </div>

                {assets.length === 0 ? (
                  <div className="text-sm text-slate-500 italic text-center py-4 bg-slate-50 rounded-lg border border-dashed">
                    Chưa có tài sản nào
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {assets.map((asset, index) => (
                      <div key={index} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border">
                        <div className="grid grid-cols-12 gap-2 flex-1">
                          <div className="col-span-5">
                            <Input
                              placeholder="Tên (VD: Tủ lạnh)"
                              value={asset.name}
                              onChange={(e) => updateAsset(index, "name", e.target.value)}
                              className="h-8 text-sm bg-white"
                              required
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              min="1"
                              placeholder="SL"
                              value={asset.quantity}
                              onChange={(e) => updateAsset(index, "quantity", Number(e.target.value))}
                              className="h-8 text-sm bg-white"
                              required
                            />
                          </div>
                          <div className="col-span-4">
                            <select
                              className="flex h-8 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              value={asset.status}
                              onChange={(e) => updateAsset(index, "status", e.target.value)}
                            >
                              <option value="Tốt">Tốt</option>
                              <option value="Mới">Mới</option>
                              <option value="Cũ">Cũ</option>
                              <option value="Hư hỏng">Hư hỏng</option>
                            </select>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => removeAsset(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                  Hủy
                </Button>
                <Button onClick={handleUpdate} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Tên phòng</span>
                  <span className="font-bold text-slate-800 text-lg">{room.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Giá thuê (tháng)</span>
                  <span className="font-bold text-emerald-600 text-lg">{formatter.format(room.price)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Diện tích</span>
                  <span className="font-medium text-slate-700">{room.area ? `${room.area} m²` : "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Sức chứa</span>
                  <span className="font-medium text-slate-700">{room.maxCapacity ? `${room.maxCapacity} người` : "—"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500 font-medium">Khu trọ</span>
                  <span className="font-medium text-slate-700">{room.property ? room.property.name : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trạng thái</span>
                  <Badge
                    variant={room.status === "AVAILABLE" ? "default" : room.status === "RENTED" ? "destructive" : "secondary"}
                    className={room.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : room.status === "RENTED" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}
                  >
                    {room.status === "AVAILABLE" ? "Phòng trống" : room.status === "RENTED" ? "Đã Thuê" : "Bảo Trì"}
                  </Badge>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-medium pb-2 border-b">
                  <Package className="w-4 h-4 text-slate-500" />
                  Danh sách tài sản ({room.assets?.length || 0})
                </div>
                {(!room.assets || room.assets.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-2">Phòng chưa được ghi nhận tài sản nào.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.assets.map((asset, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                        <div>
                          <p className="font-medium text-slate-700">{asset.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Số lượng: {asset.quantity}</p>
                        </div>
                        <Badge variant="outline" className={
                          asset.status === "Hư hỏng" ? "text-rose-600 border-rose-200 bg-rose-50" :
                          asset.status === "Mới" ? "text-emerald-600 border-emerald-200 bg-emerald-50" :
                          "text-slate-600"
                        }>
                          {asset.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  Phòng đang ở trạng thái <strong>{room.status === "AVAILABLE" ? "Phòng trống" : room.status === "RENTED" ? "Đã Thuê" : "Bảo Trì"}</strong>.
                  {room.status === "RENTED" && " Bạn không thể xóa hay chuyển sang bảo trì phòng này khi đang có hợp đồng hiệu lực."}
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <Button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-700">
                  <PencilLine className="w-4 h-4 mr-2" /> Chỉnh sửa
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
