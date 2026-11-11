import { fetchWithAuth } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tenant, Contract } from "@/types";
import { User, Phone, Mail, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import { TenantProfileForm } from "@/components/portal/tenant-profile-form";

async function getProfile(): Promise<Tenant & { contract?: Contract }> {
  const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/portal/me`, { cache: 'no-store' });
  if (!res.ok) redirect("/login");
  return res.json();
}

export default async function TenantProfilePage() {
  const profile = await getProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Thông tin cá nhân</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Quản lý hồ sơ và cập nhật thông tin liên lạc</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-none shadow-md bg-white/70 backdrop-blur-md h-fit">
          <CardHeader className="bg-slate-50/50 border-b pb-4 text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
            <CardTitle className="text-lg">{profile.fullName}</CardTitle>
            <CardDescription className="text-sm">
              Người đứng tên hợp đồng
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="min-w-0 break-all">CCCD: <b className="text-slate-800">{profile.cccd}</b></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="min-w-0 break-all">SĐT: <b className="text-slate-800">{profile.phone}</b></span>
            </div>
            {profile.email && (
              <div className="flex items-center gap-3 text-sm text-slate-600 break-all">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span><b className="text-slate-800">{profile.email}</b></span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-md bg-white/70 backdrop-blur-md">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-lg">Chỉnh sửa thông tin</CardTitle>
            <CardDescription>
              Bạn có thể tự cập nhật số điện thoại, email và ảnh CCCD. Họ tên và số CCCD không thể tự đổi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <TenantProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
