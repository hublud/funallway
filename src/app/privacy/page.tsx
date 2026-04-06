import Link from "next/link";
import { ChevronLeft, ShieldCheck, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition text-sm font-bold mb-6 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Legal & Compliance</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-500 mt-2">Last updated: April 4, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none space-y-12">
          {/* Section 1 */}
          <section className="space-y-4 font-sans">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">01</span>
              Information We Collect
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>
                To provide our services as a connection platform, we collect specific information from both escorts and users:
              </p>
              <ul className="list-disc space-y-2 pl-4 marker:text-blue-500">
                <li><span className="font-bold text-slate-900">Escort Identity:</span> Full names, ages, and profile media (photos/videos).</li>
                <li><span className="font-bold text-slate-900">Location Data:</span> We record the state and city escorts operate in to facilitate location-based search.</li>
                <li><span className="font-bold text-slate-900">Contact Details:</span> WhatsApp numbers are stored securely to allow connections between users and escorts.</li>
                <li><span className="font-bold text-slate-900">Technical Data:</span> IP addresses and browser types for security and fraud prevention.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">02</span>
              How We Use Your Information
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>We use the data collected for the following purposes:</p>
              <ul className="list-disc space-y-2 pl-4 marker:text-blue-500">
                <li>To maintain your public profile on our discovery board.</li>
                <li>To process subscription payments and connection fees.</li>
                <li>To enable registered users to access escort contact information via connection payments.</li>
                <li>To improve platform security and prevent account impersonation.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">03</span>
              Data Protection & Security
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>
                We prioritize the security of your data. We use industry-standard encryption protocols (SSL/TLS) for data transmission and secure cloud infrastructure for storage.
              </p>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800 font-medium leading-relaxed italic">
                  Note: While we take every precaution, no method of online transmission or storage is 100% secure. We cannot guarantee absolute security but commit to notification in the case of any confirmed data breach.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">04</span>
              User Rights & Control
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>
                You have full control over your data on funallway. You can request to update your information or delete your account at any time by contacting our admin support team.
              </p>
            </div>
          </section>

          {/* Contact Bar */}
          <div className="pt-12 border-t border-slate-100">
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black mb-1 italic">Questions about your data?</h3>
                  <p className="text-slate-400 text-sm">Our legal team is here to assist you.</p>
                </div>
                <Link href="mailto:support@funalltheway.com" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-100 transition shadow-lg">
                  <Mail className="w-5 h-5" />
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
