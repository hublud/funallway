"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppSupport() {
  const whatsappNumber = "2347038473900";
  const message = encodeURIComponent("Hello Admin, I have an enquiry/complaint regarding Baddies212.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-24 sm:bottom-8 right-6 z-50 flex flex-col items-end gap-2 group">
      {/* Tooltip-style label */}
      <div className="bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 text-slate-700 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap mb-1">
        Complaints or Enquiries? <span className="text-blue-600 ml-1">Chat with Admin</span>
      </div>
      
      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 hover:bg-green-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-200 transition-all duration-300 hover:scale-110 active:scale-95 group-hover:rotate-12"
        aria-label="Contact Admin on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 fill-white/20" />
        
        {/* Pulsing notification dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
      </a>
    </div>
  );
}
