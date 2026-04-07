import Link from "next/link";
import { ChevronLeft, FileText, Mail, Lock } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-100 font-sans">
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition text-sm font-bold mb-6 group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Platform Agreement</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms & Conditions</h1>
          <p className="text-slate-500 mt-2">Last updated: April 4, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-slate max-w-none space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm non-italic">01</span>
              Eligibility & Use
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed font-sans">
              <p>
                By using Baddies212, you represent and warrant that you are at least <span className="font-bold text-slate-900 underline decoration-blue-500 decoration-2">18 years of age</span>.
              </p>
              <ul className="list-disc space-y-2 pl-4 marker:text-blue-500">
                <li><span className="font-bold text-slate-900">Registered Escorts:</span> Must provide accurate personal detail and current profile images.</li>
                <li><span className="font-bold text-slate-900">Site Users:</span> Use of the platform is strictly for the purpose of connecting with escorts. Any and all offline interactions are entirely at the personal risk and responsibility of the users involved.</li>
                <li><span className="font-bold text-slate-900">Misuse:</span> Automated scraping, account impersonation, and unauthorized commercial use are strictly prohibited.</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm non-italic">02</span>
              Fees & Payments
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>
                As a connection platform, Baddies212 operates on a paid access model:
              </p>
              <ul className="list-disc space-y-2 pl-4 marker:text-blue-500">
                <li><span className="font-bold text-slate-900 font-sans">Escort Subscriptions:</span> Weekly or Monthly plans give escorts visibility on the discovery board. Fees are for access to the platform services.</li>
                <li><span className="font-bold text-slate-900">User Connection Fees:</span> Small, one-time fees paid to access an escort&apos;s WhatsApp contact information. This fee represents the connection service provided by the platform.</li>
                <li><span className="font-bold text-slate-900 italic">No Refunds:</span> All digital sales are final. We do not provide refunds once a subscription is active or a contact has been unlocked.</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 font-sans">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">03</span>
              Independence of Escorts
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed">
              <p>
                Baddies212 is a pure connection platform. Escorts are independent service providers and <span className="underline decoration-red-500 decoration-2 font-bold text-slate-900 uppercase italic">NOT employees, agents, or partners</span> of this platform.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-sm font-medium leading-relaxed italic text-slate-700">
                Important: &quot;The Platform&quot; does not background-check users. Both escorts and users are strongly advised to prioritize personal safety and meeting in public spaces for initial connections.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 italic">
              <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm non-italic">04</span>
              Prohibited Conduct
            </h2>
            <div className="pl-11 space-y-4 text-slate-600 leading-relaxed font-sans">
              <p>The platform reserves the right to suspend or ban account without notice if any of the following occur:</p>
              <ul className="list-decimal space-y-2 pl-4 marker:text-slate-900 font-bold">
                <li>Harassment, threats, or abuse directed at other users or escorts.</li>
                <li>Misuse of contact information (WhatsApp numbers) for spam or resale.</li>
                <li>Sharing illegal content or promoting illegal activities via the platform.</li>
              </ul>
            </div>
          </section>

          {/* Contact Bar */}
          <div className="pt-12 border-t border-slate-100">
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black mb-1 italic">Questions about these terms?</h3>
                  <p className="text-blue-100 text-sm">Reviewing or amending these at any time via support.</p>
                </div>
                <Link href="mailto:legal@baddies212.com" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-100 transition shadow-lg shrink-0">
                  <Mail className="w-5 h-5" />
                  Legal Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
