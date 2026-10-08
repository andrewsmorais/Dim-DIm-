import { AppLayout } from "@/components/AppLayout";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <AppLayout>{children}</AppLayout>
    </SettingsProvider>
  );
}
