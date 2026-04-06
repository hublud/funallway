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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={40}
                height={40}
                priority
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-bold sm:text-xl text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                funall<span className="text-blue-600">way</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition">
                <Search className="w-5 h-5" />
              </button>
              {isLoggedIn ? (
                <Link 
                  href="/dashboard"
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="My Account"
                >
                  <User className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  href="/auth"
                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                  title="Login"
                >
                  <User className="w-5 h-5" />
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

