import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import ThemeWrapper from "@/components/layout/ThemeWrapper";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import ArticleIcon from "@mui/icons-material/Article";
import PeopleIcon from "@mui/icons-material/People";
import AddTask from "@mui/icons-material/AddTask";
import AdminHeader from "@/components/admin/AdminHeader";
import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata = {
  title: "Admin - Pesona Kebaikan",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeWrapper>
        <div className="min-h-[100lvh] w-full bg-gray-100 dark:bg-[#0b1220] transition-colors duration-300">
          <div className="w-full px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
              <aside className="h-fit rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-4 shadow-sm">
                <div className="mb-6 flex items-center gap-3 px-2">
                  <div className="relative h-9 w-9 rounded-lg overflow-hidden">
                    <Image src="/brand/logo.png" alt="Pesona Kebaikan" fill className="object-contain" sizes="36px" />
                  </div>
                  <div className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-50">Pesona Kebaikan</div>
                </div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-2 mb-2">Dashboard</div>
                <nav className="space-y-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-[#1e293b] dark:hover:text-blue-400 transition-colors"
                  >
                    <DashboardIcon fontSize="small" />
                    Dashboard
                  </Link>
                </nav>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 px-2 mt-6 mb-2">Pages</div>
                <nav className="space-y-1">
                  <Link
                    href="/admin/campaign"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-[#1e293b] dark:hover:text-blue-400 transition-colors"
                  >
                    <CampaignIcon fontSize="small" />
                    Campaign
                  </Link>
                </nav>
                <nav className="space-y-1">
                  <Link
                    href="/admin/campaign"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-[#1e293b] dark:hover:text-blue-400 transition-colors"
                  >
                    <AddTask fontSize="small" />
                    Blog
                  </Link>
                  <Link
                    href="/admin/users"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-[#1e293b] dark:hover:text-blue-400 transition-colors"
                  >
                    <PeopleIcon fontSize="small" />
                    Users
                  </Link>
                </nav>
              </aside>
              <div className="space-y-4">
                <div className="sticky top-0 z-10">
                  <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-[#0b1324] px-3 py-2 border border-gray-200 dark:border-gray-800">
                        <SearchIcon fontSize="small" className="text-gray-500 dark:text-gray-400" />
                        <input
                          placeholder="Search"
                          className="w-full bg-transparent text-sm outline-none text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        />
                      </div>
                      <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0b1324]">
                        <NotificationsNoneIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
                      </button>
                      <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#0b1324]">
                        <SettingsOutlinedIcon fontSize="small" className="text-gray-700 dark:text-gray-300" />
                      </button>
                      <Avatar sx={{ width: 32, height: 32 }} />
                    </div>
                  </div>
                </div>
                <main className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f172a] p-6 shadow-sm">{children}</main>
              </div>
            </div>
          </div>
        </div>
      </ThemeWrapper>
    </AppRouterCacheProvider>
  );
}
