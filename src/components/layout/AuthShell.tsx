export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-100 dark:bg-[#0b1220] px-3 py-6 transition-colors duration-300">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
