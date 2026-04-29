import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
			<div className="relative mb-4 inline-flex items-center justify-center">
				<div className="absolute h-[140%] w-[140%] rounded-full bg-primary/20 blur-[30px]" />
				<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[8rem] font-extrabold leading-none text-foreground/5">
					404
				</span>
				<span className="relative z-1 bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-[5rem] font-extrabold leading-none text-transparent">
					404
				</span>
			</div>

			<h2 className="relative z-1 mb-2 text-xl font-bold text-foreground">
				Halaman Tidak Ditemukan
			</h2>

			<p className="mx-auto mb-5 max-w-xs leading-relaxed text-text-secondary">
				Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin telah
				dipindahkan atau dihapus.
			</p>

			<Link
				href="/"
				className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-white shadow-[0_10px_20px_-5px_var(--color-primary-light)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_25px_-5px_var(--color-primary)]"
			>
				<ArrowLeft size={20} />
				Kembali ke Beranda
			</Link>
		</div>
	);
}
