"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import { Property } from "@/types";

export function CreateRoomDialog({ properties = [] }: { properties?: Property[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [assets, setAssets] = useState<{ name: string; quantity: number; status: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          area: area ? Number(area) : undefined,
          maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
          assets,
          propertyId: propertyId || undefined,
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo phòng");

      setOpen(false);
      setName("");
      setPrice("");
      setArea("");
      setMaxCapacity("");
      setAssets([]);
      setPropertyId("");
      toast.success("Thêm phòng thành công");
      router.refresh(); // Reload data
    } catch (error) {
      console.error(error);
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
        <Plus className="w-4 h-4" />
        <span>Thêm phòng</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm phòng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cơ bản cho phòng mới.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên phòng</Label>
            <Input
              id="name"
              placeholder="VD: Phòng 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá thuê (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                placeholder="VD: 3500000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Diện tích (m2)</Label>
              <Input
                id="area"
                type="number"
                placeholder="VD: 25"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxCapacity">Sức chứa tối đa (người)</Label>
            <Input
              id="maxCapacity"
              type="number"
              placeholder="VD: 3"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Khu trọ (Tùy chọn)</Label>
            <select
              id="property"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">Không thuộc khu nào</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tài sản trong phòng</Label>
              <Button type="button" variant="outline" size="sm" onClick={addAsset} className="h-8">
                <Plus className="w-3 h-3 mr-1" /> Thêm tài sản
              </Button>
            </div>

            {assets.length === 0 ? (
              <div className="text-sm text-slate-500 italic text-center py-2 bg-slate-50 rounded-lg">Không có tài sản nào</div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {assets.map((asset, index) => (
                  <div key={index} className="flex gap-2 items-start bg-slate-50 p-2 rounded-lg border">
                    <div className="grid grid-cols-12 gap-2 flex-1">
                      <div className="col-span-5">
                        <Input
                          placeholder="Tên (VD: Máy lạnh)"
                          value={asset.name}
                          onChange={(e) => updateAsset(index, "name", e.target.value)}
                          className="h-8 text-sm"
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
                          className="h-8 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-4">
                        <select
                          className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
