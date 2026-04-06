import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Profile } from "@/lib/mockData";

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_60px_rgba(30,64,175,0.2)] transition-all duration-700 border-2 border-blue-100/50 hover:border-blue-400/30 transform hover:-translate-y-3 ring-1 ring-blue-600/5 group-hover:ring-blue-600/20">
        
        {/* Image Section */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-50">
          <Image
            src={profile.profileImage}
            alt={profile.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {/* Subtle Gradient Overlay for Typography Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
          
          {/* Featured Badge */}
          {profile.isFeatured && (
            <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-in fade-in zoom-in duration-500 delay-200">
              <Sparkles className="w-3 h-3" />
              <span>Premium</span>
            </div>
          )}

          {/* Info overlaid on image with better typography */}
          <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-xl font-display font-black text-white flex items-center gap-2 leading-none tracking-tight">
                {profile.name} <span className="text-white/60 font-medium">{profile.age}</span>
              </h3>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-blue-100 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>{profile.state}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Connect</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
