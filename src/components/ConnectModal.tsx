"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Check, ArrowUpRight } from "lucide-react";
import { Profile } from "@/lib/mockData";
import { getPlatformSettings, DEFAULT_SETTINGS } from "@/utils/pricing";

interface ConnectModalProps {
  profile: Profile;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectModal({ profile, isOpen, onClose }: ConnectModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState(DEFAULT_SETTINGS.connection_fee);
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useEffect(() => {
    async function loadPrice() {
      const settings = await getPlatformSettings();
      setPrice(settings.connection_fee);
    }
    if (isOpen) loadPrice();
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (typeof (window as any).PaystackPop === "undefined") {
        throw new Error("Payment gateway could not load. Please disable adblockers or check your connection.");
      }

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(price * 100), // Kobo (rounded just in case of decimals)
        currency: "NGN",
        ref: `CON-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
        onClose: () => {
          setLoading(false);
          setError("Payment was cancelled.");
        },
      callback: (response: any) => {
        setLoading(false);

        // FIX 1: Properly encode WhatsApp URL and guarantee Country Code
        const waText = encodeURIComponent(
          `Hello ${profile.name}, I found your profile on Baddies212 and would like to connect!`
        );
        
        let safeNum = (profile.whatsappNumber || "234").replace(/\D/g, "");
        // If it's a local Nigerian number starting with 0, convert to 234...
        if (safeNum.startsWith("0")) {
          safeNum = "234" + safeNum.substring(1);
        }
        
        const url = `https://wa.me/${safeNum}?text=${waText}`;
        setWhatsappUrl(url);
        setPaymentSuccess(true);

        // FIX 2: Record the connection fee transaction in the database
        fetch("/api/payment/record-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId: profile.id,
            payerEmail: email,
            amount: price,
            reference: response.reference,
          }),
        }).catch(err => {
          console.error("Failed to record connection fee:", err);
        });

        // We removed automatic window.open() here because mobile WebViews 
        // (like Instagram/Facebook) crash when automatically redirecting to deep links.
        // Instead, the user will see the Success screen and click the button manually.
      },
    });

    handler.openIframe();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Payment gateway couldn't load. Please refresh.");
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal / Drawer */}
      <div className="relative bg-white w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95 duration-300 rounded-t-3xl sm:rounded-2xl shadow-2xl pb-safe">
        {/* Mobile drag indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        <div className="flex justify-between items-center p-4 pt-2 sm:pt-4 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-800">
            {paymentSuccess ? "Payment Successful" : "Unlock Connection"}
          </h2>
          {!paymentSuccess && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="p-8 text-center min-h-[320px] flex flex-col justify-center">
          {paymentSuccess ? (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-inner">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2 font-display uppercase tracking-tight">Success!</h3>
              <p className="text-slate-600 mb-4 font-medium">
                Payment of ₦{price.toLocaleString()} verified.
              </p>
              <p className="text-slate-500 font-bold text-sm mb-6">
                Click the button below to start your chat.
              </p>
              {/* Manual fallback button in case popup was blocked */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { onClose(); setPaymentSuccess(false); setEmail(""); setWhatsappUrl(""); }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 px-6 rounded-2xl transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </a>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Connect with {profile.name}</h3>
              <p className="text-slate-600 mb-6">
                Pay a one-time connection fee of <strong>₦{price.toLocaleString()}</strong> to unlock their direct WhatsApp number.
              </p>
              
              <div className="mb-6 text-left">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Your Email Address
                </label>
                <input 
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full bg-slate-50 border ${error ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:ring-4 focus:ring-blue-50'} rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-300`}
                />
                {error && (
                  <p className="text-red-500 text-[10px] font-bold mt-2 ml-1 uppercase tracking-tight italic">
                    {error}
                  </p>
                )}
              </div>
              
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-4 rounded-2xl transition shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group transform active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Pay via Paystack
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-slate-400 mt-6 uppercase font-bold tracking-widest">
                Secure payments verified by Paystack
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
