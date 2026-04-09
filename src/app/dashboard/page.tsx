"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { User, Image as ImageIcon, CreditCard, Save, Map, Search, X, UploadCloud, Shield, Calendar, Sparkles, Loader2, LogOut, Menu, Home } from "lucide-react";
import { INTERESTS_LIST } from "@/lib/mockData";
import { NIGERIAN_STATES, WORLD_COUNTRIES } from "@/lib/states";
import FilePreview from "@/components/FilePreview";
import { createClient } from "@/utils/supabase/client";
import { getPlatformSettings, type PlatformSettings, DEFAULT_SETTINGS } from "@/utils/pricing";
import Link from "next/link";

type Tab = "profile" | "services" | "rates" | "media" | "security" | "subscription";

// Force dynamic rendering to prevent static pre-rendering errors with user sessions
export const dynamic = 'force-dynamic';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  // Profile State
  const [formData, setFormData] = useState({
    username: "",
    age: "",
    gender: "female" as "male" | "female",
    locationType: "national" as "national" | "international",
    baseState: "",
    whatsapp: "",
    bio: "",
    travelStates: [] as string[],
    rates: [
      { service: "SHORT TIME", incall: 0, outcall: 0 },
      { service: "OVER NIGHT", incall: 0, outcall: 0 },
      { service: "WEEKEND", incall: 0, outcall: 0 }
    ],
    interests: [] as string[],
  });
  const [stateSearch, setStateSearch] = useState("");

  const availableLocations = formData.locationType === "national" ? NIGERIAN_STATES : WORLD_COUNTRIES;

  const filteredStates = availableLocations.filter(s => 
    s.toLowerCase().includes(stateSearch.toLowerCase()) && 
    !formData.travelStates.includes(s) &&
    s !== formData.baseState
  );

  const toggleTravelState = (stateName: string) => {
    if (formData.travelStates.includes(stateName)) {
      setFormData(prev => ({ ...prev, travelStates: prev.travelStates.filter(s => s !== stateName) }));
    } else {
      setFormData(prev => ({ ...prev, travelStates: [...prev.travelStates, stateName] }));
    }
    setStateSearch("");
  };

  const handleRateChange = (index: number, field: "incall" | "outcall", value: string) => {
    const newRates = [...formData.rates];
    newRates[index] = { ...newRates[index], [field]: parseInt(value) || 0 };
    setFormData({ ...formData, rates: newRates });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => {
      const interests = prev.interests || [];
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };

  // Media State
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);
  const [existingGalleryImages, setExistingGalleryImages] = useState<string[]>([]);

  // Security State
  const [passwordState, setPasswordState] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const searchParams = useSearchParams();
  const paymentSuccess = searchParams.get("payment") === "success";

  // Subscription State
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [plan, setPlan] = useState<"weekly" | "monthly">("monthly");
  const [isFeatured, setIsFeatured] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);

  const daysRemaining = expiresAt ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         window.location.href = '/';
         return;
      }
      setUserId(user.id);
      setUserEmail(user.email ?? null);
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) {
        setFormData({
          username: profile.username || "",
          age: profile.age ? profile.age.toString() : "",
          gender: profile.gender || "female",
          locationType: profile.location_type || "national",
          baseState: profile.state || "",
          whatsapp: profile.whatsapp_number || "",
          bio: profile.bio || "",
          travelStates: profile.can_travel_to || [],
          rates: profile.rates && profile.rates.length > 0 ? profile.rates : [
            { service: "SHORT TIME", incall: 0, outcall: 0 },
            { service: "OVER NIGHT", incall: 0, outcall: 0 },
            { service: "WEEKEND", incall: 0, outcall: 0 }
          ],
          interests: profile.interests || []
        });
        setIsSubscribed(profile.is_subscribed);
        setIsFeatured(profile.is_featured);
        setPlan(profile.plan || "monthly");
        setExpiresAt(profile.subscription_expires_at);
        setExistingProfileImage(profile.profile_image || null);
        setExistingGalleryImages(profile.gallery_images || []);
      }
      setIsLoading(false);
      
      // Fetch platform settings
      const settings = await getPlatformSettings();
      setPlatformSettings(settings);
    }
    loadProfile();
  }, [supabase]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    
    try {
      let finalProfileImageUrl = existingProfileImage;
      let finalGalleryImageUrls = [...existingGalleryImages];

      // Upload new cover photo if any
      if (coverPhoto) {
        const ext = coverPhoto.name.split('.').pop() || 'jpg';
        const path = `${userId}/cover-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('profiles').upload(path, coverPhoto);
        if (!upErr) {
           finalProfileImageUrl = supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl;
        }
      }

      // Upload new gallery photos if any
      if (galleryPhotos.length > 0) {
        for (let i = 0; i < galleryPhotos.length; i++) {
          const file = galleryPhotos[i];
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `${userId}/gallery-${Date.now()}-${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from('profiles').upload(path, file);
          if (!upErr) {
             finalGalleryImageUrls.push(supabase.storage.from('profiles').getPublicUrl(path).data.publicUrl);
          }
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          age: parseInt(formData.age) || null,
          gender: formData.gender,
          location_type: formData.locationType,
          state: formData.baseState,
          whatsapp_number: formData.whatsapp,
          bio: formData.bio,
          can_travel_to: formData.travelStates,
          rates: formData.rates,
          interests: formData.interests,
          profile_image: finalProfileImageUrl,
          gallery_images: finalGalleryImageUrls
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state with the saved URLs and clear pending uploads
      setExistingProfileImage(finalProfileImageUrl);
      setExistingGalleryImages(finalGalleryImageUrls);
      setCoverPhoto(null);
      setGalleryPhotos([]);
      
      alert("Settings saved successfully!");
      setIsEditing(false); // Exit edit mode on save
    } catch (err: any) {
      console.error("Error saving profile:", err);
      alert("Failed to save settings: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenew = (selectedPlan: "weekly" | "monthly") => {
    if (!userId || !userEmail) return;
    
    // 4. Open Paystack Inline Popup
    const amount = selectedPlan === 'weekly' 
      ? platformSettings.weekly_sub_price * 100 
      : platformSettings.monthly_sub_price * 100; // in kobo
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount,
      currency: 'NGN',
      ref: `FAW-RENEW-${userId.slice(0,8)}-${Date.now()}`,
      metadata: { userId, plan: selectedPlan },
      callback_url: `${appUrl}/api/payment/verify`,
      onClose: () => {
        alert("Renewal cancelled.");
      },
      callback: (response: any) => {
        // Redirect to verify endpoint which activates profile and redirects to dashboard
        window.location.href = `${appUrl}/api/payment/verify?reference=${response.reference}`;
      },
    });
    handler.openIframe();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Escort Settings</h1>

      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-green-800 text-lg">🎉 Payment Successful! Your profile is now active.</h3>
            <p className="text-sm text-green-700 mt-1">You are now listed on the Discovery page. Welcome to Baddies212!</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-center text-blue-600">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-bold">Loading your dashboard...</p>
        </div>
      ) : (
        <div className="w-full relative">
          
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 shadow-md shadow-blue-200 rounded-xl font-bold text-white hover:bg-blue-700 transition"
            >
              <Menu className="w-5 h-5" />
              <span>Menu Options</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className={`
          fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity md:static md:bg-transparent md:z-auto md:w-64 md:flex-shrink-0 md:opacity-100 md:pointer-events-auto
          ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}>
          <div className={`
            absolute left-0 top-0 bottom-0 w-[280px] bg-white p-6 shadow-2xl transition-transform md:static md:w-full md:p-0 md:bg-transparent md:shadow-none md:translate-x-0 overflow-y-auto
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            
            <div className="flex items-center justify-between md:hidden mb-6 pb-4 border-b border-slate-100">
              <h2 className="font-extrabold text-2xl text-slate-900">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-2 pb-4 md:pb-0">
              <Link href="/" className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition shadow-sm border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-blue-600">
                <Home className="w-4 h-4" /> Home / Discovery
              </Link>
              
              <div className="h-px bg-slate-100 my-2 hidden md:block"></div>

              <button 
                onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'profile' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <User className="w-4 h-4" /> Profile Settings
              </button>
              <button 
                onClick={() => { setActiveTab("media"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'media' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <ImageIcon className="w-4 h-4" /> Media & Gallery
              </button>
              <button 
                onClick={() => { setActiveTab("services"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'services' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <Sparkles className="w-4 h-4" /> My Services / Interests
              </button>
              <button 
                onClick={() => { setActiveTab("rates"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'rates' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <CreditCard className="w-4 h-4" /> Rate Card
              </button>
              <button 
                onClick={() => { setActiveTab("subscription"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'subscription' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <CreditCard className="w-4 h-4" /> Subscription
              </button>
              <button 
                onClick={() => { setActiveTab("security"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap shadow-sm border ${activeTab === 'security' ? 'bg-blue-600 text-white border-blue-700 shadow-blue-100' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-blue-600'}`}
              >
                <Shield className="w-4 h-4" /> Security
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-red-600 bg-white hover:bg-red-50 transition border border-slate-100 hover:border-red-100 shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm min-h-[600px]">
          
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-slate-100 pb-4 gap-4">
                <h2 className="font-black text-xl text-slate-800 uppercase tracking-tight">Profile Details</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-sm ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white shadow-blue-100 active:scale-[0.98]'}`}
                >
                  {isEditing ? "Cancel Editing" : "Edit Profile"}
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.username} 
                      onChange={e => setFormData({...formData, username: e.target.value})} 
                      disabled={!isEditing}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={e => setFormData({...formData, age: e.target.value})} 
                      disabled={!isEditing}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value as "male" | "female"})}
                      disabled={!isEditing}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 disabled:text-slate-500 appearance-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
                    <select 
                      value={formData.locationType}
                      onChange={(e) => setFormData({...formData, locationType: e.target.value as "national" | "international", baseState: "", travelStates: []})}
                      disabled={!isEditing}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 disabled:text-slate-500 appearance-none"
                    >
                      <option value="national">Nigeria</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                     <select 
                       value={formData.baseState}
                       onChange={(e) => setFormData({...formData, baseState: e.target.value})}
                       disabled={!isEditing}
                       className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-600 outline-none disabled:bg-slate-50 disabled:text-slate-500 appearance-none"
                     >
                       <option value="">Select Location</option>
                       {availableLocations.map(state => <option key={state} value={state}>{state}</option>)}
                     </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                    <input 
                      type="tel" 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                      disabled={!isEditing}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none transition disabled:bg-slate-50 disabled:text-slate-500" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={e => setFormData({...formData, bio: e.target.value})} 
                    disabled={!isEditing}
                    rows={4} 
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none transition resize-none disabled:bg-slate-50 disabled:text-slate-500"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Map className="w-4 h-4 text-blue-600"/> Travel Preferences</h3>
                  {formData.travelStates.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.travelStates.map(state => (
                        <span key={state} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                          {state}
                          {isEditing && (
                            <button onClick={() => toggleTravelState(state)} className="text-blue-400 hover:text-red-500 rounded-full p-0.5"><X className="w-3.5 h-3.5" /></button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                  {isEditing && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-slate-400" /></div>
                      <input type="text" placeholder="Search states to add..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none" />
                      {stateSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredStates.map(state => (
                            <button key={state} onClick={() => toggleTravelState(state)} className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700">{state}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === "services" && (
            <div className="animate-in fade-in duration-300">
               <h2 className="font-bold text-xl mb-2 text-slate-800">My Services (I am into)</h2>
               <p className="text-sm text-slate-500 border-b border-slate-100 pb-4 mb-6">Select the services and activities you are comfortable with. These will appear on your public profile.</p>
               
               <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Currently Selected ({formData.interests.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.length > 0 ? formData.interests.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                        {interest}
                        <button onClick={() => toggleInterest(interest)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-sm text-slate-400 italic">No services selected yet. Select from the list below.</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-[450px] overflow-y-auto p-2 border border-slate-100 rounded-2xl custom-scrollbar-rich">
                  {INTERESTS_LIST.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-100 scale-[0.98]' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RATES TAB */}
          {activeTab === "rates" && (
            <div className="animate-in fade-in duration-300">
               <h2 className="font-bold text-xl mb-2 text-slate-800">My Rate Card</h2>
               <p className="text-sm text-slate-500 border-b border-slate-100 pb-4 mb-6">Manage your service pricing for both incall and outcall.</p>
               
               <div className="space-y-6">
                 <div className="hidden sm:grid grid-cols-3 gap-4 mb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <div className="col-span-1">Service</div>
                   <div className="text-center">Incall (₦)</div>
                   <div className="text-center">Outcall (₦)</div>
                 </div>
                 
                 {formData.rates.map((rate, idx) => (
                   <div key={rate.service} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="font-bold text-slate-700 text-sm sm:text-base border-b sm:border-0 border-slate-200 pb-2 sm:pb-0">{rate.service}</div>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">In</span>
                       <input 
                         type="number" 
                         value={rate.incall || ""}
                         onChange={(e) => handleRateChange(idx, "incall", e.target.value)}
                         className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-base font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition"
                         placeholder="0"
                       />
                     </div>
                     <div className="relative">
                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">Out</span>
                       <input 
                         type="number" 
                         value={rate.outcall || ""}
                         onChange={(e) => handleRateChange(idx, "outcall", e.target.value)}
                         className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-base font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition"
                         placeholder="0"
                       />
                     </div>
                   </div>
                 ))}

                 <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 text-blue-600">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 text-sm">Transparency Policy</h4>
                        <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                          Your rates are displayed publicly on your profile to help users make informed decisions. Ensure your pricing is accurate to maintain high trust ratings.
                        </p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {/* MEDIA TAB */}
          {activeTab === "media" && (
             <div className="animate-in fade-in duration-300">
               <h2 className="font-bold text-xl mb-6 text-slate-800 border-b border-slate-100 pb-4">Manage Media (Updated Preview)</h2>
               
               <div className="space-y-8">
                  {/* Privacy Notice */}
                  <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                    <span className="text-sm mt-0.5">🔒</span>
                    <p className="text-xs text-indigo-700 font-medium leading-snug">
                      <span className="font-black">Privacy Notice:</span> Models <span className="font-black uppercase">must</span> cover their faces with an emoji, sticker, or blur it completely before uploading any photos to protect their identity.
                    </p>
                  </div>

                  {/* Cover Photo */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-slate-700">Cover Photo</p>
                      {coverPhoto && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">New Unsaved Match</span>}
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition mb-3 relative overflow-hidden group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 relative">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-slate-600 font-medium">{coverPhoto ? "Replace cover photo" : "Upload new cover photo"}</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files && e.target.files.length > 0) setCoverPhoto(e.target.files[0]) }} />
                    </label>

                    {existingProfileImage && !coverPhoto && (
                      <div className="mt-4 relative group aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-200">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Cover</p>
                        <img src={existingProfileImage} alt="Current Cover" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    )}

                    {coverPhoto && (
                      <div className="mt-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Cover Preview</p>
                        <FilePreview 
                          file={coverPhoto} 
                          onRemove={() => setCoverPhoto(null)} 
                          className="aspect-[16/9] w-full"
                        />
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-slate-700">Gallery Photos</p>
                      {galleryPhotos.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">+{galleryPhotos.length} Unsaved</span>}
                    </div>

                    {existingGalleryImages.length > 0 && (
                      <div className="mb-4">
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4">
                          {existingGalleryImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                              <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setExistingGalleryImages(prev => prev.filter((_, i) => i !== idx))} 
                                className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition mb-4 mt-2">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600 font-medium">Add more photos to gallery</p>
                      </div>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => { if (e.target.files) setGalleryPhotos(prev => [...prev, ...Array.from(e.target.files!)]) }} />
                    </label>

                    {galleryPhotos.length > 0 && (
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 mt-2">
                        {galleryPhotos.map((file, idx) => (
                          <FilePreview 
                            key={`${file.name}-${idx}`}
                            file={file} 
                            onRemove={() => setGalleryPhotos(prev => prev.filter((_, i) => i !== idx))} 
                            className="aspect-square"
                          />
                        ))}
                      </div>
                    )}
                  </div>
               </div>
             </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === "subscription" && (
             <div className="animate-in fade-in duration-300">
               <h2 className="font-bold text-xl mb-6 text-slate-800 border-b border-slate-100 pb-4">Active Subscription</h2>
               
                <div className="bg-gradient-to-br from-blue-600 flex-col sm:flex-row to-blue-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8 flex items-start sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-blue-200 font-medium text-sm mb-1 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Current Status
                    </p>
                    <h3 className="text-3xl font-black mb-2">{isExpired ? 'Subscription Expired' : (plan === 'monthly' ? 'Monthly Access' : 'Weekly Access')}</h3>
                    <p className="text-blue-100 bg-white/10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm">
                      <Calendar className="w-4 h-4" /> {isExpired ? 'Expired on:' : (daysRemaining <= 3 ? 'Expiring very soon:' : 'Expires on:')} <strong className="text-white">{expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}</strong>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="text-4xl font-black">{daysRemaining}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Days Left</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className={`p-6 rounded-2xl border-2 transition ${plan === 'weekly' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                    <h4 className="font-bold text-lg mb-1">Weekly Plan</h4>
                    <p className="text-2xl font-black text-blue-600 mb-4">₦{platformSettings.weekly_sub_price.toLocaleString()}</p>
                    <button 
                      onClick={() => handleRenew('weekly')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
                    >
                      {plan === 'weekly' && !isExpired ? 'Extend Weekly' : 'Select Weekly'}
                    </button>
                  </div>

                  <div className={`p-6 rounded-2xl border-2 transition ${plan === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-lg">Monthly Plan</h4>
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">BEST VALUE</span>
                    </div>
                    <p className="text-2xl font-black text-blue-600 mb-4">₦{platformSettings.monthly_sub_price.toLocaleString()}</p>
                    <button 
                      onClick={() => handleRenew('monthly')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition"
                    >
                      {plan === 'monthly' && !isExpired ? 'Extend Monthly' : 'Select Monthly'}
                    </button>
                  </div>
                </div>

                {isExpired && (
                  <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-red-800 text-lg leading-tight">Your account visibility is currently hidden</h3>
                      <p className="text-sm text-red-700 mt-1">Your subscription expired on {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'recently'}. Renew any plan above to reactivate your listing on the discovery page.</p>
                    </div>
                  </div>
                )}


             </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
             <div className="animate-in fade-in duration-300">
               <h2 className="font-bold text-xl mb-6 text-slate-800 border-b border-slate-100 pb-4">Update Password</h2>
               <div className="max-w-md space-y-5">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                   <input type="password" value={passwordState.current} onChange={e => setPasswordState({...passwordState, current: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                   <input type="password" value={passwordState.new} onChange={e => setPasswordState({...passwordState, new: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                   <input type="password" value={passwordState.confirm} onChange={e => setPasswordState({...passwordState, confirm: e.target.value})} className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-600 outline-none" />
                 </div>
               </div>
             </div>
          )}
          
        </div>
      </div>

      {/* Global Action Footer */}
      {((activeTab === 'profile' && isEditing) || activeTab === 'rates' || activeTab === 'media' || activeTab === 'security') && (
        <div className="sticky bottom-4 sm:relative sm:bottom-0 mt-8 flex justify-end z-20">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl transition flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 uppercase tracking-widest text-xs active:scale-[0.98]"
          >
            {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save {activeTab} Changes
          </button>
        </div>
      )}
      </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen py-32 text-center text-blue-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">Preparing your dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
