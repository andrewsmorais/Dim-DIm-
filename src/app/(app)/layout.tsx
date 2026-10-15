import { AppLayout } from "@/components/AppLayout";
import { PlanGate } from "@/components/PlanGate";
import { SettingsProvider } from "@/contexts/SettingsContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SettingsProvider>
      <AppLayout>
        <PlanGate>{children}</PlanGate>
      </AppLayout>
    </SettingsProvider>
  );
}
