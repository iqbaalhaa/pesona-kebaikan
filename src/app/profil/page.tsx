import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start p-6 pb-24">
      <Image className="dark:invert mb-8" src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-semibold leading-8 tracking-tight text-black dark:text-zinc-50">To get started, edit the page.tsx file.</h1>
        <p className="text-base leading-6 text-zinc-600 dark:text-zinc-400">
          Looking for a starting point or more instructions? Head over to{" "}
          <a href="https://vercel.com/templates?framework=next.js" className="font-medium text-zinc-950 dark:text-zinc-50">
            Templates
          </a>{" "}
          or the{" "}
          <a href="https://nextjs.org/learn" className="font-medium text-zinc-950 dark:text-zinc-50">
            Learning
          </a>{" "}
          center.
        </p>
      </div>
      <div className="flex flex-col gap-3 text-sm font-medium mt-8 w-full">
        <a
          className="flex items-center justify-center gap-2 rounded-full bg-black text-white py-3 transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          href="https://vercel.com/new"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image className="dark:invert" src="/vercel.svg" alt="Vercel logomark" width={16} height={16} />
          Deploy Now
        </a>
        <a
          className="flex items-center justify-center rounded-full border border-gray-300 py-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900"
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
      </div>
    </div>
  );
}
