"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/auth-fetch";
import { CreditCard, Save, Loader2, Building, User, Hash, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bankName: "",
    bankAccount: "",
    bankAccountName: "",
    defaultElectricityPrice: 3500,
    defaultWaterPrice: 20000,
    invoiceCreationDay: 1,
    paymentDeadlineDays: 5,
    telegramChatId: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            bankName: data.bankName || "",
            bankAccount: data.bankAccount || "",
            bankAccountName: data.bankAccountName || "",
            defaultElectricityPrice: data.defaultElectricityPrice || 3500,
            defaultWaterPrice: data.defaultWaterPrice || 20000,
            invoiceCreationDay: data.invoiceCreationDay || 1,
            paymentDeadlineDays: data.paymentDeadlineDays || 5,
            telegramChatId: data.telegramChatId || "",
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      toast.success("Cập nhật thông tin ngân hàng thành công!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin tài khoản và cấu hình hệ thống.
        </p>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b bg-muted/30 px-6 py-4 flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Thông tin thanh toán (VietQR)</h2>
            <p className="text-sm text-muted-foreground">
              Thông tin này sẽ được dùng để tự động tạo mã VietQR trên hóa đơn.
            </p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Tên Ngân hàng (Viết tắt)</label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="VD: MB, VCB, Techcombank, VPBank..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sử dụng mã BIN hoặc tên viết tắt phổ biến (MB, VCB, TCB, VPB...)
                </p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Số Tài Khoản</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    placeholder="VD: 1903123456789"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Tên Chủ Tài Khoản (Không dấu)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    name="bankAccountName"
                    value={formData.bankAccountName}
                    onChange={handleChange}
                    placeholder="VD: NGUYEN VAN A"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background uppercase placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6">
              <h3 className="font-medium text-slate-800 mb-4">Cấu hình Vận hành & Dịch vụ</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Giá Điện mặc định (VNĐ/kWh)</label>
                  <input
                    type="number"
                    name="defaultElectricityPrice"
                    value={formData.defaultElectricityPrice}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Giá Nước mặc định (VNĐ/m3 hoặc người)</label>
                  <input
                    type="number"
                    name="defaultWaterPrice"
                    value={formData.defaultWaterPrice}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Ngày chốt hóa đơn (Mùng mấy hàng tháng)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    name="invoiceCreationDay"
                    value={formData.invoiceCreationDay}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Hạn đóng tiền (Số ngày)</label>
                  <input
                    type="number"
                    min="1"
                    name="paymentDeadlineDays"
                    value={formData.paymentDeadlineDays}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6">
              <h3 className="font-medium text-slate-800 mb-4">Kết nối Thông báo (Bot Telegram)</h3>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-600">Telegram Chat ID</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <input
                    name="telegramChatId"
                    value={formData.telegramChatId}
                    onChange={handleChange}
                    placeholder="VD: 123456789"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhắn tin với @RawDataBot trên Telegram để lấy ID của bạn, hệ thống sẽ gửi tin nhắn thông báo khi có người thanh toán tiền phòng.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu cài đặt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
