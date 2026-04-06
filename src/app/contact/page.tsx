"use client";

import { MessageCircle, Mail, Clock, MapPin, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const whatsappNumber = "2347038473900";
  const message = encodeURIComponent("Hello Admin, I have an enquiry/complaint regarding funallway.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="flex-1 w-full bg-mesh min-h-screen">
      
      {/* Page Header */}
      <div className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Support Center
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-slate-900 leading-tight">
            How Can We <span className="text-gradient">Help You?</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-500 font-medium">
            Whether you have a question about setting up your profile, or need technical assistance, our support team is ready to assist.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Contact Card */}
          <div className="lg:col-span-12 glass p-8 sm:p-12 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Direct Support</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    The fastest way to get help is via our official WhatsApp support channel. Our admins are available to guide you through any process.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Support Hours</p>
                      <p className="text-slate-900 font-bold">9:00 AM — 6:00 PM</p>
                      <p className="text-slate-500 text-sm font-medium italic">Monday to Saturday</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email Enquiry</p>
                      <p className="text-slate-900 font-bold">support@funallway.com</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-xl shadow-green-200 hover:shadow-green-300 transition-all duration-300 hover:scale-[1.02] active:scale-95 group/btn"
                  >
                    <MessageCircle className="w-6 h-6 fill-white/20" />
                    <span className="font-display font-black uppercase tracking-widest text-sm">Chat on WhatsApp</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/10 to-blue-400/5 rounded-[40px] blur-xl" />
                <div className="relative bg-white/50 backdrop-blur-sm p-4 rounded-[40px] border border-white/40 shadow-xl">
                  <img 
                    src="/contact-illustration.png" 
                    alt="Contact Support" 
                    className="w-full h-auto rounded-[32px] object-cover mix-blend-multiply opacity-80"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000";
                    }}
                  />
                  <div className="absolute bottom-10 left-10 right-10 glass p-6 rounded-3xl animate-bounce-slow">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Online Now</span>
                    </div>
                    <p className="text-slate-900 font-bold leading-tight italic text-sm">
                      "I'm here to help you get started with your premium listing."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Info */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {[
              { 
                title: "Safety First", 
                desc: "We prioritize your safety. Report any suspicious behavior immediately to our moderation team.",
                icon: Sparkles
              },
              { 
                title: "Global Support", 
                desc: "Our international desk handles enquiries for escorts outside of Nigeria with priority care.",
                icon: MapPin 
              },
              { 
                title: "Privacy Matters", 
                desc: "Your data is encrypted and handled according to our strict privacy and confidentiality protocols.",
                icon: ChevronRight 
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/40 hover:bg-white/60 p-8 rounded-3xl border border-white/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-6 text-blue-600 border border-blue-100">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-display font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
