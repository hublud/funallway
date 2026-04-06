"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      title: selectedStates.length > 0 ? "Search Results" : "All Models",
      subtitle: selectedStates.join(", "),
      profiles: filtered
    }];
  };

  const sections = getCategorizedProfiles(profiles);
  const totalResults = sections.reduce((acc, s) => acc + s.profiles.length, 0);

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Filters & Search Section */}
      <div className="flex flex-col gap-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 font-display uppercase italic">
              Discovery
            </h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">
              Find verified models by location & travel preferences.
            </p>
            <div className="mt-4">
              <Link 
                href="/auth" 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Register as a model
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by location or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-3xl pl-12 sm:pl-14 pr-12 py-4 sm:py-5 focus:border-blue-600 outline-none transition shadow-xl shadow-slate-200/50 text-base sm:text-lg font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="relative flex-shrink-0">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`h-full border-2 px-6 sm:px-8 py-4 sm:py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-3 transition shadow-xl whitespace-nowrap text-sm sm:text-base ${selectedStates.length > 0 ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200' : 'bg-white border-slate-100 text-slate-900 hover:border-blue-200'}`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              {selectedStates.length > 0 ? `${selectedStates.length} Selected` : "Select Location"}
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Multi-Select Drawer/Dropdown */}
            {showFilters && (
              <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:top-full sm:right-0 z-50 sm:mt-4">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm sm:hidden" onClick={() => setShowFilters(false)} />
                <div className="relative w-full sm:w-80 max-h-[85vh] sm:max-h-[500px] overflow-y-auto bg-white border border-slate-200 rounded-t-[32px] sm:rounded-[32px] shadow-2xl p-6 sm:p-4 pb-12 sm:pb-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
                  <div className="flex items-center justify-between mb-6 sm:mb-4 px-1">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Locations</p>
                      <p className="text-[10px] text-slate-400/80 font-bold">You can choose more than one state</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {selectedStates.length > 0 && (
                        <button onClick={() => setSelectedStates([])} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Clear all</button>
                      )}
                      <button onClick={() => setShowFilters(false)} className="sm:hidden p-1 bg-slate-100 rounded-full text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* State Search Input */}
                  <div className="mb-4 relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search locations..."
                      value={stateQuery}
                      onChange={(e) => setStateQuery(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition"
                    />
                    {stateQuery && (
                      <button 
                        onClick={() => setStateQuery("")}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {filteredStates.map(state => (
                      <button 
                        key={state}
                        onClick={() => toggleState(state)}
                        className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition flex items-center justify-between group ${selectedStates.includes(state) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="flex items-center gap-3 italic">
                          <MapPin className={`w-4 h-4 ${selectedStates.includes(state) ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400 opacity-50'}`} />
                          {state}
                        </span>
                        {selectedStates.includes(state) && <Check className="w-4 h-4 stroke-[3px]" />}
                      </button>
                    ))}
                    {filteredStates.length === 0 && (
                      <p className="text-center py-4 text-xs text-slate-400 italic">No locations found</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Type & Gender Filters */}
        <div className="flex flex-col gap-4">
          {/* Region Toggle */}
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide align-center w-full">
            {[
              { id: 'all', label: 'Global', short: 'Global', icon: Globe },
              { id: 'national', label: 'Nigeria', short: 'Nigeria', icon: MapPin },
              { id: 'international', label: 'International', short: "Int'l", icon: MapIcon }
            ].map((l) => {
              const Icon = l.icon;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setLocationType(l.id as any);
                    setSelectedStates([]); // clear states when changing scope
                  }}
                  className={`flex-shrink-0 px-4 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${locationType === l.id ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{l.label}</span>
                  <span className="sm:hidden">{l.short}</span>
                </button>
              );
            })}
          </div>

          {/* Gender Toggle */}
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide align-center w-full">
            {[
              { id: 'all', label: 'Everyone', short: 'All' },
              { id: 'female', label: 'Females only', short: 'Females' },
              { id: 'male', label: 'Males only', short: 'Males' }
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGender(g.id as any)}
                className={`flex-shrink-0 px-4 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${selectedGender === g.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-600 ring-offset-2' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                <span className="hidden sm:inline">{g.label}</span>
                <span className="sm:hidden">{g.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Chips */}
        {selectedStates.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-300">
             {selectedStates.map(state => (
               <button 
                key={state}
                onClick={() => toggleState(state)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-200 transition"
               >
                 {state}
                 <X className="w-3.5 h-3.5" />
               </button>
             ))}
          </div>
        )}
      </div>

      {/* Grouped Results Display */}
      <div className="space-y-16 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-blue-600">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="font-bold">Loading Discovery...</p>
          </div>
        ) : totalResults > 0 ? (
          sections.map((section, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="mb-8 flex items-baseline gap-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{section.title}</h2>
                {section.subtitle && <span className="text-blue-600 font-black text-xs uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{section.subtitle}</span>}
                <div className="h-px flex-1 bg-slate-100 ml-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
                {section.profiles.map((profile) => (
                  <ProfileCard key={`${section.title}-${profile.id}`} profile={profile} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 shadow-inner">
              <Search className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase italic">No matches found</h3>
            <p className="text-slate-400 mt-2 font-medium">Try broadening your search or selecting different states.</p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedStates([]); }}
              className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition shadow-xl"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

