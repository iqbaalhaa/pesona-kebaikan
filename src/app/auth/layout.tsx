import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import AuthShell from "@/components/layout/AuthShell";
import ThemeWrapper from "@/components/layout/ThemeWrapper";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeWrapper>
        <AuthShell>{children}</AuthShell>
      </ThemeWrapper>
    </AppRouterCacheProvider>
  );
}
