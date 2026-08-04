import { AppShell } from "@/components/layout/AppShell";
import { CompanyThemeProvider } from "@/lib/theme";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CompanyThemeProvider>
      <AppShell>{children}</AppShell>
    </CompanyThemeProvider>
  );
}
