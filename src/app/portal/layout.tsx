import { TenantPaymentNotifications } from "@/components/portal/tenant-payment-notifications";

export default function TenantPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <TenantPaymentNotifications />
      {children}
    </>
  );
}
