import type { Metadata } from "next";
import { AppLayout } from "@/components/AppLayout";
import { PlanGate } from "@/components/PlanGate";
import { SettingsProvider } from "@/contexts/SettingsContext";

// Área logada: nunca deve aparecer em buscadores.
export const metadata: Metadata = { robots: { index: false, follow: false } };

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
