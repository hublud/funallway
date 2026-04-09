"use client";

import Link from "next/link";
import { UserPlus, LogIn, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function AuthHub() {
  const router = useRouter();
  const supabase = createClient();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Sign In
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      // 2. Fetch Profile to check Role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error during login:", profileError);
        // Better error message if the column is actually missing from schema cache
        if (profileError.message.includes("column") || profileError.message.includes("schema")) {
           throw new Error("System is updating. Please try again in a few seconds.");
        }
        // Fallback to dashboard if it's just a missing profile row
        router.push("/dashboard");
        return;
      }

      // 3. Role-Based Redirect
      if (profile.is_admin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Login Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8">Sign in to your escort dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition" 
                placeholder="Enter your email" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition pr-12" 
                  placeholder="Enter your password" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-sm mt-4 flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Create Account Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl shadow-lg border border-blue-500 text-white relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-6">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Escort Profile</h2>
            <p className="text-blue-100 mb-6">Join our marketplace and start connecting.</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 mb-8 border border-white/20">
              <h3 className="font-bold flex items-center gap-2 mb-2 text-yellow-300">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center text-sm">!</span>
                Registration Notice
              </h3>
              <p className="text-sm text-blue-50 leading-relaxed mb-3">
                Registration is only for escorts. If you want to get the services of an escort, you do not need to create an account and can connect with an escort on the escort discovery page.
              </p>
              <p className="text-sm text-yellow-100 leading-relaxed font-semibold bg-black/20 p-3 rounded-lg border border-white/10 flex items-start gap-2">
                <span>⚠️</span> 
                <span>Models must cover their faces with an emoji, sticker, or blur their faces before uploading any public images to the platform.</span>
              </p>
            </div>

            <Link 
              href="/auth/register"
              className="block w-full bg-white text-blue-600 hover:bg-slate-50 font-bold py-3.5 px-4 rounded-xl transition shadow-sm text-center"
            >
              Create Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
