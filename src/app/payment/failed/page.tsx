"use client";
import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-slate-500 mb-8">
          Your payment could not be completed. Please try again. If the issue persists, contact support.
        </p>
        <Link
          href="/auth/register"
          className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
        >
          Try Again
        </Link>
        <Link href="/" className="block text-slate-400 text-sm mt-4 hover:text-slate-600">
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
