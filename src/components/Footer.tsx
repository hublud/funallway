import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto pb-28 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-slate-500 text-sm">
            © {currentYear} funallway. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link 
              href="/contact"
              className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-black uppercase tracking-widest transition shadow-sm inline-flex items-center gap-2"
            >
              Contact Support
            </Link>
            <Link href="/privacy" className="text-slate-500 hover:text-blue-600 transition tracking-tight">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-blue-600 transition tracking-tight">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
