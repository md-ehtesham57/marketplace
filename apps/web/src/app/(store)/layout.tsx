import { AppNavbar } from "@/components/navbar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-sky-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Market<span className="text-sky-500">place</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} Marketplace. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <a href="/privacy" className="hover:text-sky-500 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-sky-500 transition-colors">Terms</a>
              <a href="/contact" className="hover:text-sky-500 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}