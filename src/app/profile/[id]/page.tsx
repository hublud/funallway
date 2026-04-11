import { notFound } from "next/navigation";
import { MapPin, ChevronLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProfileClientActions from "@/components/ProfileClientActions";
import ImageGallery from "@/components/ImageGallery";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Profile } from "@/lib/mockData";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: profileRecord } = await supabase.from('profiles').select('*').eq('id', id).single();

  if (!profileRecord) {
    notFound();
  }

  // Map from snake_case to camelCase
  const profile: Profile = {
    ...profileRecord,
    profileImage: profileRecord.profile_image,
    galleryImages: profileRecord.gallery_images,
    isFeatured: profileRecord.is_featured,
    isSubscribed: profileRecord.is_subscribed,
    locationType: profileRecord.location_type,
    whatsappNumber: profileRecord.whatsapp_number,
    canTravelTo: profileRecord.can_travel_to
  };

  return (
    <div className="flex-1 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto pb-24">
        {/* Navigation Bar / Back - Offset by Navbar height (16 units/4rem) */}
        <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center">
          <Link href="/" className="flex items-center text-slate-500 hover:text-slate-900 transition gap-1 font-medium">
            <ChevronLeft className="w-5 h-5" />
            Back to Discovery
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 p-4 sm:p-8">
          {/* Left Column: Image Gallery */}
          <div className="flex-1">
            <ImageGallery 
              images={[profile.profileImage, ...profile.galleryImages]} 
              altPrefix={profile.name}
              isFeatured={profile.isFeatured}
            />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="flex-1 flex flex-col pt-2 md:pt-8 md:pl-4">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 flex flex-wrap items-baseline gap-3">
                {profile.name} <span className="text-2xl sm:text-3xl text-slate-400 font-medium">{profile.age}</span>
              </h1>
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex items-center gap-2 text-slate-500 text-lg">
                  <MapPin className="w-5 h-5" />
                  <span>{profile.state}{profile.locationType === 'national' && ', Nigeria'}</span>
                </div>
                {profile.canTravelTo && profile.canTravelTo.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">I can travel to: </span>
                    {profile.canTravelTo.map(state => (
                      <span key={state} className="bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium rounded-full">
                        {state}
                      </span>
                    ))}
                  </div>
                )}

                {/* I am into: Section moved here */}
                {profile.interests && profile.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center mt-2 animate-in fade-in slide-in-from-right-4 duration-500">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">I am into: </span>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span 
                          key={interest} 
                          className="inline-flex items-center bg-blue-50/50 hover:bg-blue-100 transition-colors border border-blue-100 text-blue-700 px-3 py-1 rounded-xl text-xs font-bold shadow-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="prose prose-slate prose-lg mb-8">
              <p className="text-slate-600 leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Rates Section */}
            {profile.rates && profile.rates.length > 0 && (
              <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full">
                <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  Rates (NGN)
                </h3>
                <div className="bg-slate-50/50 rounded-3xl border border-slate-100 overflow-x-auto w-full pb-2">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4 sm:pl-8">Service</th>
                        <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Incall</th>
                        <th className="px-4 sm:px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center pr-4 sm:pr-8">Outcall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {profile.rates.map((rate) => (
                        <tr key={rate.service} className="group hover:bg-white transition-colors">
                          <td className="px-4 sm:px-6 py-5 font-bold text-slate-600 text-sm pl-4 sm:pl-8 group-hover:text-pink-600 transition-colors uppercase tracking-tight">
                            {rate.service}
                          </td>
                          <td className="px-4 sm:px-6 py-5 text-center font-black text-slate-900">
                            {rate.incall > 0 ? `₦${rate.incall.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 sm:px-6 py-5 text-center font-black text-slate-900 pr-4 sm:pr-8">
                            {rate.outcall > 0 ? `₦${rate.outcall.toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Scroll indicator for mobile displays */}
                <div className="mt-2 text-center text-[10px] sm:hidden text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1 opacity-80">
                  <span>&larr;</span> SWIPE TO LEFT TO SEE ALL PRICES
                </div>
              </div>
            )}

            {/* Advertise with Baddies212 Banner */}
            <div className="mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-shadow duration-500">
                <Image
                  src="/images/profile-ad.jpg"
                  alt="Advertise with us at Baddies212"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="mt-auto">
              <div className="hidden sm:block">
                <ProfileClientActions profile={profile} />
              </div>
              
              <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 text-sm text-slate-600 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs mt-0.5">!</div>
                <p>
                  Connecting reveals direct WhatsApp contact. Ensure you conduct all communications respectfully according to our platform guidelines.
                </p>
              </div>

              {/* Mobile-only CTA callout with arrow */}
              <div className="sm:hidden mt-10 mb-8 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-rose-50 border border-rose-200 shadow-xl shadow-rose-100 px-6 py-4 rounded-3xl text-center relative max-w-[280px]">
                  <p className="text-sm font-bold text-rose-700 leading-relaxed">
                    Click on the WhatsApp button to connect with the above baddie.
                  </p>
                </div>
                {/* Red Arrow */}
                <div className="mt-4 text-red-500 hover:text-red-600 transition animate-bounce">
                  <svg className="w-8 h-8 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Mobile CTA - Offset by Mobile Bottom Navbar (16 units + safe area) */}
      <div className="sm:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-100 z-[60] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <ProfileClientActions profile={profile} />
      </div>
    </div>
  );
}
