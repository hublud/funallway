"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Profile } from "@/lib/mockData";
import ProfileCard from "@/components/ProfileCard";
import { Filter, Search, X, MapPin, Sparkles, ChevronDown, Check, Globe, Map as MapIcon, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { NIGERIAN_STATES, WORLD_COUNTRIES } from "@/lib/states";

export default function Home() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<"all" | "male" | "female">("all");
  const [locationType, setLocationType] = useState<"all" | "national" | "international">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStates, selectedGender, locationType]);

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'active')
        .eq('is_subscribed', true)
        .order('created_at', { ascending: false });
        
      if (data) {
        // Convert snake_case from DB back to camelCase for the frontend
        const mappedProfiles = data.map(p => ({
          ...p,
          locationType: p.location_type,
          profileImage: p.profile_image,
          galleryImages: p.gallery_images,
          isFeatured: p.is_featured,
          isSubscribed: p.is_subscribed,
          whatsappNumber: p.whatsapp_number,
          canTravelTo: p.can_travel_to
        }));
        setProfiles(mappedProfiles);
      }
      setIsLoading(false);
    }
    fetchProfiles();
  }, []);

  const toggleState = (state: string) => {
    setSelectedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state) 
        : [...prev, state]
    );
  };

  const filteredStates = (() => {
    let list: string[] = [];
    if (locationType === "national") list = NIGERIAN_STATES;
    else if (locationType === "international") list = WORLD_COUNTRIES;
    else list = [...NIGERIAN_STATES, ...WORLD_COUNTRIES];
    
    return list.filter(s => s.toLowerCase().includes(stateQuery.toLowerCase()));
  })();

  // Helper to categorize profiles for a specific state
  const getCategorizedProfiles = (profiles: Profile[]) => {
    let filtered = profiles.filter(p => p.isSubscribed);

    if (selectedGender !== "all") {
      filtered = filtered.filter(p => p.gender === selectedGender);
    }

    if (locationType !== "all") {
      filtered = filtered.filter(p => p.locationType === locationType);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.username.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q)
      );
    }

    if (selectedStates.length > 0) {
      filtered = filtered.filter(p => 
         selectedStates.includes(p.state) || 
         p.canTravelTo.some(t => selectedStates.includes(t))
      );
    }

    // Default return is sequential order (oldest to newest mock data placement)
    return [{
      title: selectedStates.length > 0 ? "Search Results" : "All Escorts",
      subtitle: selectedStates.join(", "),
      profiles: filtered
    }];
  };

  const sections = getCategorizedProfiles(profiles);
  const totalResults = sections.reduce((acc, s) => acc + s.profiles.length, 0);

  return (
    <div className="flex-1 w-full bg-mesh min-h-screen">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-400/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
          {/* Advertise Banner */}
          <div className="mx-auto w-full max-w-2xl mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-shadow duration-500">
              <Image
                src="/images/advertise-banner.jpg"
                alt="Advertise with us at Baddies212"
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Premium Escort Discovery
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-display font-black tracking-tight text-slate-900 leading-[1.1]">
            Connect with <span className="text-gradient">Elite Escorts</span> <br className="hidden sm:block" /> Across the Globe
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 font-medium leading-relaxed">
            Discover verified escorts by location, style, and travel preferences. Join the most exclusive marketplace today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link 
              href="/auth" 
              className="px-8 py-4 bg-navy text-white font-display font-black rounded-2xl shadow-2xl shadow-navy/20 hover:scale-[1.02] transition-all duration-300 active:scale-95 uppercase tracking-widest text-sm"
            >
              Register as an escort
            </Link>
            <button 
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-navy font-display font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all duration-300 active:scale-95 border border-slate-100 uppercase tracking-widest text-sm"
            >
              Start Browsing
            </button>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 w-full">
            {/* Top Decorative Banner */}
            <div className="relative group w-[95%] max-w-[350px] aspect-square sm:w-[300px] sm:h-[300px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-blue-400/10 rounded-[2rem] blur-xl group-hover:opacity-100 transition duration-1000 opacity-70"></div>
              <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden h-full flex items-center justify-center">
                <Image 
                  src="/images/home-banner.jpg" 
                  alt="Baddies212.com Banner" 
                  width={300}
                  height={300}
                  className="w-full h-full object-contain rounded-[1.5rem]"
                  priority
                />
              </div>
            </div>
            
            {/* Second Top Decorative Banner */}
            <div className="relative group w-[95%] max-w-[350px] aspect-square sm:w-[300px] sm:h-[300px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
              <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-blue-400/10 rounded-[2rem] blur-xl group-hover:opacity-100 transition duration-1000 opacity-70"></div>
              <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden h-full flex items-center justify-center">
                <Image 
                  src="/images/banner-extra-2.jpeg" 
                  alt="Baddies212.com Second Banner" 
                  width={300}
                  height={300}
                  className="w-full h-full object-cover rounded-[1.5rem]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="search-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Search & Filter Glass Box */}
        <div className="glass p-6 sm:p-8 rounded-[40px] space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-5 space-y-2">
              <label className="block px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyword Search</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 border-2 border-transparent rounded-[24px] pl-14 pr-12 py-4 focus:bg-white focus:border-blue-600/20 outline-none transition-all shadow-inner text-slate-900 font-medium placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Selector */}
            <div className="lg:col-span-4 space-y-2">
              <label className="block px-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Location</label>
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`w-full bg-white/50 border-2 px-6 py-4 rounded-[24px] font-bold text-slate-900 flex items-center justify-between transition-all group ${selectedStates.length > 0 ? 'border-blue-500/30' : 'border-transparent hover:border-blue-500/20'}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span>{selectedStates.length > 0 ? `${selectedStates.length} Locations` : "All Locations"}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="absolute top-full left-0 right-0 mt-4 z-[100] animate-in zoom-in-95 fade-in duration-200">
                    <div className="w-full max-h-[400px] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-4">
                      {/* State Search Input */}
                      <div className="mb-4 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Filter states..."
                          value={stateQuery}
                          onChange={(e) => setStateQuery(e.target.value)}
                          className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredStates.map(state => (
                          <button 
                            key={state}
                            onClick={() => toggleState(state)}
                            className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-between ${selectedStates.includes(state) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                          >
                            <span className="flex items-center gap-2 italic">{state}</span>
                            {selectedStates.includes(state) && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-3 flex items-center gap-3">
              <button 
                onClick={() => setLocationType('all')}
                className="flex-1 py-4 bg-navy text-white text-xs font-black uppercase tracking-widest rounded-[24px] shadow-lg shadow-navy/20 active:scale-95 transition-all"
              >
                Apply
              </button>
              {(searchQuery || selectedStates.length > 0) && (
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedStates([]); }}
                  className="p-4 bg-red-50 text-red-600 rounded-[24px] hover:bg-red-100 transition-all active:scale-95"
                  title="Clear All"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200/50">
            {/* Nav Group */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'all', icon: Globe, label: 'Global' },
                { id: 'national', icon: MapPin, label: 'Nigeria' },
                { id: 'international', icon: MapIcon, label: 'Intl' }
              ].map((l) => {
                const Icon = l.icon;
                return (
                  <button
                    key={l.id}
                    onClick={() => setLocationType(l.id as any)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${locationType === l.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {l.label}
                  </button>
                );
              })}
            </div>

            {/* Gender Group */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'all', label: 'Everyone' },
                { id: 'female', label: 'Females' },
                { id: 'male', label: 'Males' }
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGender(g.id as any)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGender === g.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Sections */}
        <div className="space-y-20 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 text-center text-blue-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-display font-bold uppercase tracking-widest">Curating Escorts...</p>
            </div>
          ) : totalResults > 0 ? (
            sections.map((section, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="mb-10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-3">
                      {section.title}
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                    </h2>
                    {section.subtitle && <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{section.subtitle}</p>}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent ml-4" />
                  <div className="text-slate-400 text-xs font-black uppercase tracking-widest">{section.profiles.length} Results</div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-8">
                  {section.profiles
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((profile) => (
                      <ProfileCard key={`${section.title}-${profile.id}`} profile={profile} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {section.profiles.length > ITEMS_PER_PAGE && (
                  <div className="mt-12 flex flex-wrap items-center justify-center gap-2 animate-in fade-in duration-500">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(p => Math.max(1, p - 1));
                        document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-3 bg-white text-slate-500 disabled:opacity-40 font-bold rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition active:scale-95"
                    >
                      &larr; Prev
                    </button>
                    
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full px-2 py-1 scrollbar-hide">
                      {Array.from({ length: Math.ceil(section.profiles.length / ITEMS_PER_PAGE) }).map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setCurrentPage(i + 1);
                            document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50 active:scale-95'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button 
                      disabled={currentPage >= Math.ceil(section.profiles.length / ITEMS_PER_PAGE)}
                      onClick={() => {
                        setCurrentPage(p => p + 1);
                        document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-4 py-3 bg-white text-slate-500 disabled:opacity-40 font-bold rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition active:scale-95"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center max-w-sm mx-auto">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 shadow-inner border border-slate-100">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tight">No Matches Found</h3>
              <p className="text-slate-400 mt-2 font-medium">Try adjusting your filters or expanding your search radius.</p>
              <button 
                onClick={() => { setSearchQuery(""); setSelectedStates([]); }}
                className="mt-8 px-8 py-3 bg-navy text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 mb-6 flex flex-col md:flex-row items-center justify-center gap-6 w-full">
          {/* Bottom Decorative Banner */}
          <div className="relative group w-[95%] max-w-[350px] aspect-square sm:w-[300px] sm:h-[300px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-blue-400/10 rounded-[2rem] blur-xl group-hover:opacity-100 transition duration-1000 opacity-70"></div>
            <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden h-full flex items-center justify-center">
              <Image 
                src="/images/bottom-banner.jpg" 
                alt="Baddies212.com Promotional Banner" 
                width={300}
                height={300}
                className="w-full h-full object-contain rounded-[1.5rem]"
              />
            </div>
          </div>
          
          {/* Second Bottom Decorative Banner */}
          <div className="relative group w-[95%] max-w-[350px] aspect-square sm:w-[300px] sm:h-[300px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-blue-400/10 rounded-[2rem] blur-xl group-hover:opacity-100 transition duration-1000 opacity-70"></div>
            <div className="relative bg-white p-2 rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden h-full flex items-center justify-center">
              <Image 
                src="/images/banner-extra-1.jpeg" 
                alt="Baddies212.com Second Promotional Banner" 
                width={300}
                height={300}
                className="w-full h-full object-cover rounded-[1.5rem]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

