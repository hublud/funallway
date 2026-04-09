"use client";

import { useState, useEffect } from "react";
import { NIGERIAN_STATES } from "@/lib/states";
import { Check, ChevronRight, UploadCloud, MapPin, Map, Image as ImageIcon, CreditCard, X, Search, Sparkles, Eye, EyeOff } from "lucide-react";
import { INTERESTS_LIST } from "@/lib/mockData";
import { getPlatformSettings, type PlatformSettings, DEFAULT_SETTINGS } from "@/utils/pricing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FilePreview from "@/components/FilePreview";

import { createClient } from "@/utils/supabase/client";

export default function RegisterWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      const settings = await getPlatformSettings();
      setPlatformSettings(settings);
    }
    loadSettings();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    bio: "",
    age: "",
    gender: "female" as "male" | "female",
    baseState: "",
    whatsapp: "",
    travelStates: [] as string[],
    interests: [] as string[],
    rates: [
      { service: "SHORT TIME", incall: 0, outcall: 0 },
      { service: "OVER NIGHT", incall: 0, outcall: 0 },
      { service: "WEEKEND", incall: 0, outcall: 0 },
    ],
  });

  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  
  // Media State
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);
  
  // Subscription State
  const [subPlan, setSubPlan] = useState<"weekly" | "monthly" | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search State for Step 2
  const [stateSearch, setStateSearch] = useState("");

  const filteredStates = NIGERIAN_STATES.filter(s => 
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
    setStateSearch(""); // Reset search after adding
  };

  const toggleInterest = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
    } else {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }));
    }
  };

  const handleRateChange = (index: number, field: "incall" | "outcall", value: string) => {
    const newRates = [...formData.rates];
    newRates[index] = { ...newRates[index], [field]: parseInt(value) || 0 };
    setFormData({ ...formData, rates: newRates });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleComplete = async () => {
    if (!subPlan) return;
    setIsPaying(true);
    setErrorMessage("");
    try {
      // 1. Build FormData
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('age', formData.age);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('baseState', formData.baseState);
      formDataToSend.append('whatsapp', formData.whatsapp);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('plan', subPlan);
      formDataToSend.append('travelStates', JSON.stringify(formData.travelStates));
      formDataToSend.append('interests', JSON.stringify(formData.interests));
      formDataToSend.append('rates', JSON.stringify(formData.rates));
      
      if (coverPhoto) formDataToSend.append('coverPhoto', coverPhoto);
      for (const file of galleryPhotos) {
        formDataToSend.append('galleryPhotos', file);
      }

      // 2. Submit to backend API which creates user cleanly
      const res = await fetch('/api/auth/register-model', {
        method: 'POST',
        body: formDataToSend
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      const userId = data.userId;

      // 3. Immediately sign the user in so the dashboard session is active
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      // 4. Open Paystack Inline Popup
      const amount = subPlan === 'weekly' 
        ? platformSettings.weekly_sub_price * 100 
        : platformSettings.monthly_sub_price * 100; // in kobo
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: formData.email,
        amount,
        currency: 'NGN',
        ref: `FAW-${userId.slice(0,8)}-${Date.now()}`,
        metadata: { userId, plan: subPlan },
        callback_url: `${appUrl}/api/payment/verify`,
        onClose: () => {
          setIsPaying(false);
          setErrorMessage("Payment was cancelled. Your profile was saved — you can pay later from your dashboard.");
        },
        callback: (response: any) => {
          // Redirect to verify endpoint which activates profile and redirects to dashboard
          window.location.href = `${appUrl}/api/payment/verify?reference=${response.reference}`;
        },
      });
      handler.openIframe();

    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred during registration");
      setIsPaying(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-[calc(100vh-140px)] flex flex-col py-8 px-4 sm:px-6">
      <div className="max-w-2xl w-full mx-auto">
        
        {/* Progress Nav */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <Link href="/auth" className="text-slate-500 hover:text-blue-600 text-sm font-medium">Cancel Setup</Link>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step} of 6</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200 min-h-[500px] flex flex-col">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="flex-1 animate-in fade-in duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Core Details</h2>
              <p className="text-slate-500 mb-8">Set up your escort identity and base location.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Username</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition" 
                    placeholder="E.g. AmaraBaby" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition" 
                    placeholder="you@example.com" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Short Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition resize-none" 
                    placeholder="Tell us a little bit about yourself..." 
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    min={18}
                    max={60}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition" 
                    placeholder="E.g. 24" 
                  />
                  <p className="text-xs text-slate-400 mt-1 ml-1">Must be 18 or older to register.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${formData.gender === 'female' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      Female escort
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${formData.gender === 'male' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                    >
                      Male escort
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Where are you based?</label>
                  <select 
                    value={formData.baseState}
                    onChange={(e) => setFormData({...formData, baseState: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 bg-white text-base focus:ring-2 focus:ring-blue-600 outline-none transition appearance-none"
                  >
                    <option value="" disabled>Select your resident state</option>
                    {NIGERIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">WhatsApp Number</label>
                  <input 
                    type="tel" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base focus:ring-2 focus:ring-blue-600 outline-none transition" 
                    placeholder="E.g. +234 801..." 
                  />
                </div>
              </div>
              
              <button 
                onClick={handleNext}
                disabled={!formData.email || !formData.username || !formData.password || !formData.baseState || !formData.whatsapp || !formData.age || parseInt(formData.age) < 18}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition shadow-sm mt-10"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Service Preferences */}
          {step === 2 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">What are you into?</h2>
              <p className="text-slate-500 mb-6">Select the services and interests you offer. This helps users find exactly what they&apos;re looking for.</p>
              
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">I am into ({formData.interests.length} selected):</p>
                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {formData.interests.length > 0 ? formData.interests.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm animate-in zoom-in duration-200">
                        {interest}
                        <button onClick={() => toggleInterest(interest)} className="text-slate-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-xs text-slate-400 italic">No services selected yet...</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-64 overflow-y-auto p-2 border border-slate-100 rounded-xl custom-scrollbar">
                  {INTERESTS_LIST.map(interest => {
                    const isSelected = formData.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'}`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={handleBack} className="w-1/3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition">Back</button>
                <button 
                  onClick={handleNext} 
                  disabled={formData.interests.length === 0}
                  className="w-2/3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Travel Preferences */}
          {step === 3 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <Map className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Travel Preferences (Optional)</h2>
              <p className="text-slate-500 mb-6">Are you willing to travel? Add states you can visit to attract more clients.</p>
              
              <div className="space-y-4">
                {/* Active Tags */}
                {formData.travelStates.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">I can travel to:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.travelStates.map(state => (
                        <span key={state} className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                          {state}
                          <button onClick={() => toggleTravelState(state)} className="text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add State */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search states to add..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl pl-12 pr-4 py-4 text-base focus:ring-2 focus:ring-blue-600 outline-none shadow-sm transition"
                  />
                  {stateSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredStates.length > 0 ? filteredStates.map(state => (
                        <button 
                          key={state}
                          onClick={() => toggleTravelState(state)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-slate-700"
                        >
                          {state}
                        </button>
                      )) : (
                        <div className="px-4 py-3 text-sm text-slate-500">No states found (or already added/base).</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={handleBack} className="w-1/3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition">Back</button>
                <button onClick={handleNext} className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 4: Media */}
          {step === 4 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile & Gallery</h2>
              <p className="text-slate-500 mb-6">Upload a cover photo and at least 3 gallery images.</p>
              
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <span className="text-sm mt-0.5">⚠️</span>
                <p className="text-xs text-amber-700 font-medium leading-snug">
                  <span className="font-black">Size limit:</span> Each image must be <span className="font-black">under 1MB</span>. Compress at <a href="https://squoosh.app" target="_blank" rel="noreferrer" className="underline font-black">squoosh.app</a> before uploading.
                </p>
              </div>

              <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 mb-4">
                <span className="text-sm mt-0.5">🔒</span>
                <p className="text-xs text-indigo-700 font-medium leading-snug">
                  <span className="font-black">Privacy Notice:</span> Models <span className="font-black uppercase">must</span> cover their faces with an emoji, sticker, or blur it completely before uploading any photos.
                </p>
              </div>

              {imageErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 space-y-1">
                  {imageErrors.map((err, i) => <p key={i} className="text-xs text-red-700 font-semibold">&#10060; {err}</p>)}
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-slate-700">Cover Photo (Required)</p>
                    {coverPhoto && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">1 Added</span>}
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition mb-3 active:bg-blue-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-base text-slate-500 font-bold leading-tight">{coverPhoto ? "Replace cover photo" : "Select cover photo"}</p>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Tap to upload</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => { 
                            if(e.target.files && e.target.files.length > 0) {
                              const file = e.target.files[0];
                              if (file.size > MAX_IMAGE_SIZE) {
                                setImageErrors([`"${file.name}" is too large (${(file.size/1024/1024).toFixed(1)}MB). Max size is 1MB.`]);
                                return;
                              }
                              setImageErrors([]);
                              setCoverPhoto(file);
                            }
                          }} 
                        />
                      </label>
                      
                      {/* Cover Photo Indicator */}
                      {coverPhoto && (
                        <div className="mt-4">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Cover</p>
                          <FilePreview 
                            file={coverPhoto} 
                            onRemove={() => setCoverPhoto(null)} 
                            className="aspect-[16/9] w-full"
                          />
                        </div>
                      )}
                    </div>
    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-slate-700">Gallery Photos (Min. 3 required)</p>
                        {galleryPhotos.length > 0 && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{galleryPhotos.length} Added</span>}
                      </div>
                      
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition mb-3 active:bg-blue-50">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                          <p className="text-base text-slate-500 font-bold leading-tight">Select gallery photos</p>
                          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">Tap to upload</p>
                          <p className="text-[10px] text-slate-400 mt-2">Need at least {Math.max(0, 3 - galleryPhotos.length)} more to proceed</p>
                        </div>
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => { 
                            if(e.target.files && e.target.files.length > 0) {
                              const newFiles = Array.from(e.target.files);
                              const oversized = newFiles.filter(f => f.size > MAX_IMAGE_SIZE);
                              const validFiles = newFiles.filter(f => f.size <= MAX_IMAGE_SIZE);
                              if (oversized.length > 0) {
                                setImageErrors(oversized.map(f => `"${f.name}" is too large (${(f.size/1024/1024).toFixed(1)}MB). Max size is 1MB.`));
                              } else {
                                setImageErrors([]);
                              }
                              if (validFiles.length > 0) setGalleryPhotos(prev => [...prev, ...validFiles]);
                            }
                          }} 
                        />
                  </label>

                  {/* Queued Photos Grid */}
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

              <div className="flex gap-4 mt-auto pt-10">
                <button onClick={handleBack} className="w-1/3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition">Back</button>
                <button 
                  onClick={handleNext} 
                  disabled={!coverPhoto || galleryPhotos.length < 3}
                  className="w-2/3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Rate Card */}
          {step === 5 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
               <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Rates (NGN)</h2>
              <p className="text-slate-500 mb-8">Set your pricing for different service types. Enter '0' if a service is not offered.</p>
              
              <div className="space-y-6">
                <div className="hidden sm:grid grid-cols-3 gap-4 mb-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-1">Service</div>
                  <div className="text-center">Incall</div>
                  <div className="text-center">Outcall</div>
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
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={handleBack} className="w-1/3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition">Back</button>
                <button 
                  onClick={handleNext}
                  disabled={formData.rates.every(r => r.incall === 0 && r.outcall === 0)}
                  className="w-2/3 bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Subscription Paywall */}
          {step === 6 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 mx-auto sm:mx-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center sm:text-left">Activate Profile</h2>
              <p className="text-slate-500 mb-8 text-center sm:text-left">Subscribe to be listed on the discovery page. You can cancel anytime.</p>
              
               <div className="space-y-4 mb-4 flex-1">
                <button 
                   onClick={() => setSubPlan("weekly")}
                   className={`w-full text-left p-5 rounded-2xl border-2 transition ${subPlan === 'weekly' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                   <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-slate-900 text-lg">Weekly Plan</span>
                     {subPlan === 'weekly' && <Check className="w-5 h-5 text-blue-600" />}
                   </div>
                   <p className="text-3xl font-extrabold text-blue-600">₦{platformSettings.weekly_sub_price.toLocaleString()}</p>
                   <p className="text-sm text-slate-500 mt-2">Activate and stay visible for 7 days.</p>
                </button>

                <button 
                   onClick={() => setSubPlan("monthly")}
                   className={`w-full text-left p-5 rounded-2xl border-2 transition ${subPlan === 'monthly' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'}`}
                >
                   <div className="flex justify-between items-center mb-1">
                     <span className="font-bold text-slate-900 text-lg">Monthly Plan</span>
                     <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold ml-2">SAVE 50%</span>
                     {subPlan === 'monthly' && <Check className="w-5 h-5 text-blue-600" />}
                   </div>
                   <p className="text-3xl font-extrabold text-blue-600">₦{platformSettings.monthly_sub_price.toLocaleString()}</p>
                   <p className="text-sm text-slate-500 mt-2">Best value. Stay visible for a full 30 days.</p>
                </button>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 mb-4 text-center">
                  {errorMessage}
                </div>
              )}

              <button 
                onClick={handleComplete}
                disabled={!subPlan || isPaying}
                className="w-full bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition shadow-xl mt-6 flex justify-center items-center gap-2"
              >
                {isPaying ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Pay & Activate via Paystack"
                )}
              </button>
              <button onClick={handleBack} className="w-full text-center text-slate-500 text-sm font-medium mt-4 hover:text-slate-800">
                Wait, I need to go back
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
