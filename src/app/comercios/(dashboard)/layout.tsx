import { DashboardLayout } from "@/components/DashboardLayout";
import { CommerceRoute } from "@/components/CommerceRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CommerceRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </CommerceRoute>
  );
}
