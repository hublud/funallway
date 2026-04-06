import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Profile } from "@/lib/mockData";

export default function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group block h-full">
      <div className="relative h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-slate-100 hover:ring-blue-100 transform hover:-translate-y-1">
        
        {/* Image Section */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
          <Image
            src={profile.profileImage}
            alt={profile.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
          
          {/* Featured Badge */}
          {profile.isFeatured && (
            <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Featured</span>
            </div>
          )}

          {/* Info overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold flex items-center gap-2 leading-none">
                {profile.name}, {profile.age}
              </h3>
              <span className="text-[10px] text-white/70 font-medium uppercase tracking-widest mt-0.5">@{profile.username}</span>
            </div>
            <div className="flex items-center gap-1 text-white/90 text-sm mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.state}</span>
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
