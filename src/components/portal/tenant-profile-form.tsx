"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, User } from "lucide-react";
import { Tenant } from "@/types";

export function TenantProfileForm({ profile }: { profile: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState(profile.phone || "");
  const [email, setEmail] = useState(profile.email || "");
  const [idCardFront, setIdCardFront] = useState(profile.idCardFront || "");
  const [idCardBack, setIdCardBack] = useState(profile.idCardBack || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email, idCardFront, idCardBack, avatar })
      });
      if (res.ok) {
        toast.success("Cập nhật thông tin thành công!");
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.message || "Đã xảy ra lỗi khi cập nhật");
      }
    } catch {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Số điện thoại liên lạc</Label>
        <Input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="0912345678"
        />
      </div>
      <div className="space-y-2">
        <Label>Email (Tùy chọn)</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nguyenvana@gmail.com"
        />
      </div>

      <div className="space-y-4 pt-2 border-t mt-4">
        <h3 className="text-sm font-semibold text-slate-700">Ảnh đại diện (Avatar)</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border">
            {avatar ? <Image src={avatar} alt="Avatar" fill unoptimized sizes="64px" className="object-cover" /> : <User className="w-8 h-8 text-slate-400" />}
          </div>
          <div className="space-y-2 flex-1">
            <Label>Tải ảnh mới</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setAvatar)} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t mt-4">
        <h3 className="text-sm font-semibold text-slate-700">Ảnh CCCD mới</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Mặt trước</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setIdCardFront)} />
            {idCardFront && <Image src={idCardFront} alt="CCCD Trước" width={160} height={80} unoptimized className="h-20 w-auto rounded border object-contain" />}
          </div>
          <div className="space-y-2">
            <Label>Mặt sau</Label>
            <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setIdCardBack)} />
            {idCardBack && <Image src={idCardBack} alt="CCCD Sau" width={160} height={80} unoptimized className="h-20 w-auto rounded border object-contain" />}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
