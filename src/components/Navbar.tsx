"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Search, User, Home as HomeIcon, LayoutDashboard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={38}
                  height={38}
                  priority
                  className="relative w-9 h-9 object-contain"
                />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-slate-900">
                Baddies<span className="text-blue-600">212</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <Link 
                href="/contact"
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-300"
              >
                Contact
              </Link>
              <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all duration-300">
                <Search className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-100 transition-all duration-300"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all duration-300 active:scale-[0.98]"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 w-full z-50 bg-white border-t border-slate-200 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition">
            <HomeIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition">
            <Search className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <Link 
            href={isLoggedIn ? "/dashboard" : "/auth"} 
            className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-blue-600 transition"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{isLoggedIn ? "Dashboard" : "Account"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

