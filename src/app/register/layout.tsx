import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register - Pesona Kebaikan",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 dark:bg-[#0b1220] px-0 sm:px-3 py-0 sm:py-[3px]">
      <div className="w-full max-w-sm md:hidden">{children}</div>
    </div>
  );
}
