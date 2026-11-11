import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, ReceiptText, ShieldCheck, Smartphone, Zap, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-white/10 bg-slate-950/50 backdrop-blur-md z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-1 ring-white/20">
              <img src="/logo.png" alt="Rental SaaS Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">Rental SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register">
              <Button className="bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                Dùng thử miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-300 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="w-4 h-4 text-blue-400" />
              <span>Ra mắt tính năng gạch nợ tự động SePay Open Banking</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-tight">
              Quản lý nhà trọ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                nhàn tênh, tự động hóa 100%
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Nền tảng toàn diện giúp chủ trọ quản lý hợp đồng, tính toán điện nước, thu tiền phòng và gửi thông báo hoàn toàn tự động chỉ với vài cú click chuột.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all rounded-full gap-2">
                  Bắt đầu ngay <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full bg-transparent">
                  Tìm hiểu thêm
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview mockup */}
          <div className="mt-20 relative mx-auto w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-xl pointer-events-none" />
            <div className="rounded-xl border border-white/10 bg-slate-900/50 shadow-2xl p-2 md:p-4 ring-1 ring-white/10 backdrop-blur-sm overflow-hidden">
              <div className="aspect-[16/9] w-full rounded-lg bg-slate-800 relative overflow-hidden flex items-center justify-center">
                {/* Mockup UI Inside */}
                <div className="absolute inset-0 bg-slate-950 flex">
                  {/* Mock Sidebar */}
                  <div className="w-48 border-r border-slate-800 p-4 hidden md:block">
                    <div className="h-6 w-24 bg-slate-800 rounded mb-8"></div>
                    <div className="space-y-3">
                      <div className="h-8 bg-blue-500/20 rounded"></div>
                      <div className="h-8 bg-slate-800/50 rounded"></div>
                      <div className="h-8 bg-slate-800/50 rounded"></div>
                    </div>
                  </div>
                  {/* Mock Content */}
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between">
                      <div className="h-8 w-32 bg-slate-800 rounded"></div>
                      <div className="h-8 w-24 bg-slate-800 rounded"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50"></div>
                      <div className="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50"></div>
                      <div className="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50"></div>
                      <div className="h-24 bg-slate-800/80 rounded-xl border border-slate-700/50"></div>
                    </div>
                    <div className="h-64 bg-slate-800/50 rounded-xl border border-slate-700/50"></div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="px-6 py-3 rounded-full bg-slate-900/80 border border-slate-700 backdrop-blur-md text-sm font-medium">
                    Giao diện quản lý trực quan
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Mọi thứ bạn cần để vận hành</h2>
            <p className="text-slate-400 text-lg">Hệ thống sinh ra để giải phóng bạn khỏi sổ sách Excel, giúp bạn có thêm thời gian rảnh rỗi.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ReceiptText className="w-6 h-6 text-blue-400" />}
              title="Hóa đơn & Dịch vụ động"
              description="Hỗ trợ thêm bớt các loại phí linh hoạt (Internet, Rác, Gửi xe). Chốt hóa đơn cực nhanh và xuất PDF chuyên nghiệp."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-emerald-400" />}
              title="Gạch nợ tự động (Open Banking)"
              description="Nhận tiền qua VietQR, hệ thống lập tức check biến động số dư và chuyển hóa đơn sang Đã Thu trong 3 giây."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-indigo-400" />}
              title="Quản lý Hợp đồng Chặt chẽ"
              description="Lưu trữ thông tin khách thuê, tiền cọc, theo dõi lịch sử thanh toán một cách minh bạch và an toàn tuyệt đối."
            />
            <FeatureCard
              icon={<Smartphone className="w-6 h-6 text-purple-400" />}
              title="Cổng Thông Tin Cho Khách"
              description="Tích hợp Portal dành riêng cho người thuê, giúp họ tự xem hóa đơn và báo cáo sự cố sửa chữa ngay trên điện thoại."
            />
            <FeatureCard
              icon={<ArrowRight className="w-6 h-6 text-amber-400" />}
              title="Nhắc nợ qua Email Tự động"
              description="Không cần gọi điện đòi tiền mệt mỏi. Gửi email nhắc nợ hàng loạt chỉ bằng 1 nút bấm."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-rose-400" />}
              title="Báo cáo Doanh thu Dễ hiểu"
              description="Biểu đồ trực quan so sánh doanh thu các tháng. Hỗ trợ xuất dữ liệu ra file Excel phục vụ kế toán."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Chủ nhà trọ nói gì về chúng tôi?</h2>
            <p className="text-slate-400 text-lg">Hơn 500+ chủ nhà đang sử dụng Rental SaaS mỗi ngày để thay đổi cách họ quản lý.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Anh Đạt"
              role="Chủ chuỗi 5 tòa CHDV, Bình Thạnh"
              content="Trước đây mỗi tháng tôi mất 3 ngày cuối tuần đi ghi điện nước và tính tiền. Giờ dùng Rental SaaS, mọi thứ xong gọn trong 1 buổi sáng. Cực kỳ ấn tượng tính năng gạch nợ tự động SePay!"
            />
            <TestimonialCard
              name="Chị Linh"
              role="Chủ 50 phòng trọ sinh viên, Thủ Đức"
              content="Phần mềm rất dễ dùng, không bị rườm rà như các phần mềm cũ. Sinh viên ở trọ bên mình rất thích cái Portal xem hóa đơn trên điện thoại. Không ai thắc mắc tiền điện nước nữa."
            />
            <TestimonialCard
              name="Chú Hùng"
              role="Chủ trọ 15 phòng, Tân Bình"
              content="Chú lớn tuổi rồi không rành vi tính lắm, nhưng phần mềm này thiết kế rất to rõ, trực quan. Sướng nhất là không phải gọi điện hối tiền phòng nữa, nó tự gửi email đòi tiền giùm chú."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900/50 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Bảng giá minh bạch, hợp lý</h2>
            <p className="text-slate-400 text-lg">Bắt đầu dùng thử miễn phí, nâng cấp khi quy mô của bạn lớn hơn.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Khởi đầu"
              price="Miễn phí"
              period="mãi mãi"
              description="Dành cho các chủ trọ nhỏ, mới bắt đầu quản lý."
              features={[
                "Quản lý tối đa 10 phòng",
                "Quản lý khách thuê cơ bản",
                "Xuất hóa đơn PDF",
                "Hỗ trợ qua Email"
              ]}
              buttonText="Bắt đầu ngay"
            />
            <PricingCard
              title="Chuyên nghiệp"
              price="299k"
              period="/tháng"
              description="Phổ biến nhất. Dành cho người quản lý nhà trọ chuyên nghiệp."
              features={[
                "Quản lý KHÔNG GIỚI HẠN phòng",
                "Tự động gạch nợ (SePay Open Banking)",
                "Cổng thông tin cho người thuê (Tenant Portal)",
                "Nhắc nợ qua Email tự động",
                "Báo cáo thống kê, xuất Excel"
              ]}
              buttonText="Dùng thử miễn phí 14 ngày"
              isPopular={true}
            />
            <PricingCard
              title="Chuỗi CHDV"
              price="Liên hệ"
              period=""
              description="Giải pháp thiết kế riêng cho các hệ thống lớn."
              features={[
                "Mọi tính năng của bản Chuyên nghiệp",
                "Tên miền riêng (Custom Domain)",
                "API tích hợp hệ thống khác",
                "Quản lý nhiều chi nhánh / nhân viên",
                "Hỗ trợ ưu tiên 24/7"
              ]}
              buttonText="Nhận báo giá"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Sẵn sàng để số hóa khu trọ của bạn?</h2>
          <p className="text-xl text-slate-300 mb-10">
            Hàng ngàn chủ nhà trọ đã tiết kiệm được hàng chục giờ mỗi tháng. Trải nghiệm ngay hôm nay!
          </p>
          <Link href="/register">
            <Button size="lg" className="h-16 px-10 text-xl bg-white text-blue-600 hover:bg-slate-100 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
              Đăng ký dùng thử miễn phí
            </Button>
          </Link>

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Không cần thẻ tín dụng</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Setup trong 5 phút</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-lg">Rental SaaS</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Rental SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Temporary icon component for BarChart3 (lucide-react)
function BarChart3(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, content }: { name: string, role: string, content: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
      <div>
        <Quote className="w-10 h-10 text-slate-700 mb-6" />
        <p className="text-slate-300 italic mb-8">"{content}"</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-white">{name}</h4>
          <p className="text-sm text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, period, description, features, buttonText, isPopular = false }: { title: string, price: string, period: string, description: string, features: string[], buttonText: string, isPopular?: boolean }) {
  return (
    <div className={`p-8 rounded-3xl border flex flex-col ${isPopular ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] relative scale-105 z-10' : 'bg-slate-900 border-slate-800'}`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
          Phổ biến nhất
        </div>
      )}
      <h3 className="text-xl font-medium text-slate-300 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-bold text-white">{price}</span>
        <span className="text-slate-500">{period}</span>
      </div>
      <p className="text-slate-400 text-sm mb-8 h-10">{description}</p>

      <div className="flex-1 space-y-4 mb-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPopular ? 'text-blue-400' : 'text-slate-600'}`} />
            <span className="text-slate-300 text-sm">{f}</span>
          </div>
        ))}
      </div>

      <Button className={`w-full h-12 rounded-xl font-medium ${isPopular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
        {buttonText}
      </Button>
    </div>
  );
}
