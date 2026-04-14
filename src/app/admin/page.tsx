"use client";

import { useState, useEffect } from "react";
import { mockProfiles, Profile, INTERESTS_LIST } from "@/lib/mockData";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search,
  Filter,
  Eye,
  Check,
  X,
  ArrowUpRight,
  Plus,
  UploadCloud,
  CreditCard,
  Image as ImageIcon,
  Sparkles,
  Settings,
  TrendingUp,
  History,
  Receipt,
  LogOut,
  Globe,
  Trash2,
  MapPin as MapPinIcon,
} from "lucide-react";
import { NIGERIAN_STATES, WORLD_COUNTRIES } from "@/lib/states";
import { createClient } from "@/utils/supabase/client";
import { getPlatformSettings, type PlatformSettings } from "@/utils/pricing";
import { getOptimizedUrl } from "@/utils/cloudinary";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop";

export default function AdminDashboard() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) {
        setProfiles(data.map(p => ({
          ...p,
          locationType: p.location_type,
          profileImage: p.profile_image,
          galleryImages: p.gallery_images,
          isFeatured: p.is_featured,
          isSubscribed: p.is_subscribed,
          whatsappNumber: p.whatsapp_number,
          canTravelTo: p.can_travel_to
        })));
      }

      // Fetch platform settings
      const settings = await getPlatformSettings();
      setPlatformSettings({
        weeklySubPrice: settings.weekly_sub_price,
        monthlySubPrice: settings.monthly_sub_price,
        connectionFee: settings.connection_fee
      });

      // Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (txData) setTransactions(txData);

      // Fetch custom locations
      const { data: locData } = await supabase
        .from('custom_locations')
        .select('*')
        .order('name', { ascending: true });
      if (locData) setCustomLocations(locData);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStateFilter, setSelectedStateFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: "name" | "state", direction: "asc" | "desc" } | null>(null);
  
  // New Model Form State
  const [newModel, setNewModel] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    state: "",
    locationType: "national" as "national" | "international",
    gender: "female" as "male" | "female",
    whatsapp: "",
    bio: "",
    plan: "monthly" as "weekly" | "monthly",
    coverPhoto: null as File | null,
    galleryPhotos: [] as File[],
    existingProfileImage: "" as string,
    existingGalleryImages: [] as string[],
    rates: [
      { service: "SHORT TIME", incall: 0, outcall: 0 },
      { service: "OVER NIGHT", incall: 0, outcall: 0 },
      { service: "WEEKEND", incall: 0, outcall: 0 },
    ],
    interests: [] as string[],
    canTravelTo: [] as string[],
  });
  
  const [destinationSearch, setDestinationSearch] = useState("");
  
  // Financial & Tab State
  const [activeTab, setActiveTab] = useState<"directory" | "financials" | "locations">("directory");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState({
    weeklySubPrice: 15000,
    monthlySubPrice: 45000,
    connectionFee: 5000
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [customLocations, setCustomLocations] = useState<any[]>([]);
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState<'national' | 'international'>('national');
  const [isAddingLoc, setIsAddingLoc] = useState(false);
  const [showQuickAddLoc, setShowQuickAddLoc] = useState(false);

  const openQuickAdd = () => {
    setNewLocType(newModel.locationType);
    setShowQuickAddLoc(true);
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    setIsAddingLoc(true);
    try {
      const { data, error } = await supabase
        .from('custom_locations')
        .insert({ name: newLocName.trim(), type: newLocType })
        .select();
      if (error) throw error;
      if (data) {
        setCustomLocations(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
        setNewModel(prev => ({ ...prev, state: data[0].name }));
        setNewLocName("");
      }
    } catch (err: any) {
      alert("Error adding location: " + err.message);
    } finally {
      setIsAddingLoc(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    try {
      const { error } = await supabase.from('custom_locations').delete().eq('id', id);
      if (error) throw error;
      setCustomLocations(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      alert("Error deleting location: " + err.message);
    }
  };

  const getMergedStates = (type: 'national' | 'international') => {
    const defaultList = type === 'national' ? NIGERIAN_STATES : WORLD_COUNTRIES;
    const customList = customLocations.filter(l => l.type === type).map(l => l.name);
    return [...new Set([...defaultList, ...customList])].sort();
  };

  const [transactions, setTransactions] = useState<any[]>([]);

  // Mock Stats
  const stats = [
    { label: "Total Models", value: profiles.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Subscriptions", value: profiles.filter(p => p.isSubscribed).length, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Approval", value: 3, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const handleApprove = async (id: string) => {
    await supabase.from('profiles').update({ status: 'active', is_subscribed: true }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: "active", isSubscribed: true } : p));
    alert(`Approved profile ${id}`);
  };

  const handleDeactivate = async (id: string) => {
    if (confirm("Are you sure you want to suspend this account?")) {
      await supabase.from('profiles').update({ status: 'suspended' }).eq('id', id);
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: "suspended" } : p));
    }
  };

  const handleActivate = async (id: string) => {
    await supabase.from('profiles').update({ status: 'active' }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, status: "active" } : p));
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setNewModel({
      name: profile.name,
      email: "",
      password: "",
      age: profile.age.toString(),
      state: profile.state,
      locationType: profile.locationType,
      gender: profile.gender,
      whatsapp: profile.whatsappNumber,
      bio: profile.bio || "",
      plan: profile.plan,
      coverPhoto: null,
      galleryPhotos: [],
      existingProfileImage: profile.profileImage,
      existingGalleryImages: [...profile.galleryImages],
      rates: profile.rates ? [...profile.rates] : [
        { service: "SHORT TIME", incall: 0, outcall: 0 },
        { service: "OVER NIGHT", incall: 0, outcall: 0 },
        { service: "WEEKEND", incall: 0, outcall: 0 },
      ],
      interests: profile.interests ? [...profile.interests] : [],
      canTravelTo: profile.canTravelTo ? [...profile.canTravelTo] : [],
    });
    setShowEditModal(true);
  };

  const handleUpdateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      let profileImageUrl = newModel.existingProfileImage;
      let galleryImageUrls = [...newModel.existingGalleryImages];

      if (newModel.coverPhoto) {
        const fileExt = newModel.coverPhoto.name.split('.').pop();
        const fileName = `${editingProfile.id}/cover-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, newModel.coverPhoto);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
          profileImageUrl = publicUrl;
        }
      }

      if (newModel.galleryPhotos && newModel.galleryPhotos.length > 0) {
        for (let i = 0; i < newModel.galleryPhotos.length; i++) {
          const file = newModel.galleryPhotos[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${editingProfile.id}/gallery-${Date.now()}-${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
            galleryImageUrls.push(publicUrl);
          }
        }
      }

      await supabase.from('profiles').update({
        name: newModel.name,
        age: parseInt(newModel.age),
        state: newModel.state,
        location_type: newModel.locationType,
        gender: newModel.gender,
        whatsapp_number: newModel.whatsapp,
        bio: newModel.bio,
        plan: newModel.plan,
        profile_image: profileImageUrl,
        gallery_images: galleryImageUrls,
        rates: newModel.rates,
        interests: newModel.interests,
        can_travel_to: newModel.canTravelTo,
      }).eq('id', editingProfile.id);

      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? {
        ...p,
        name: newModel.name,
        age: parseInt(newModel.age),
        state: newModel.state,
        locationType: newModel.locationType,
        gender: newModel.gender,
        whatsappNumber: newModel.whatsapp,
        bio: newModel.bio,
        plan: newModel.plan,
        profileImage: profileImageUrl,
        galleryImages: galleryImageUrls,
        rates: newModel.rates,
        interests: newModel.interests,
        canTravelTo: newModel.canTravelTo,
      } : p));

      setShowEditModal(false);
      setEditingProfile(null);
      alert("Profile updated successfully!");
    } catch(err) {
      alert("Error updating profile.");
    }
  };

  const handleReject = (id: string) => {
    if(confirm("Are you sure you want to reject this profile?")) {
      alert(`Rejected profile ${id}`);
    }
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    // Provide a random username for admin added profiles
    const generatedUsername = newModel.name.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);

    // Create a temporary ID
    const tempId = crypto.randomUUID();

    try {
      let profileImageUrl = "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop";
      let galleryImageUrls: string[] = [];

      if (newModel.coverPhoto) {
        const fileExt = newModel.coverPhoto.name.split('.').pop();
        const fileName = `manual-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, newModel.coverPhoto);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
          profileImageUrl = publicUrl;
        }
      }

      if (newModel.galleryPhotos && newModel.galleryPhotos.length > 0) {
        for (let i = 0; i < newModel.galleryPhotos.length; i++) {
          const file = newModel.galleryPhotos[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `gallery-${Date.now()}-${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file);
          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(fileName);
            galleryImageUrls.push(publicUrl);
          }
        }
      }

      // Call the secure API route for real user creation and activated membership
      const response = await fetch('/api/admin/create-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newModel.email,
          password: newModel.password,
          name: newModel.name,
          username: generatedUsername,
          age: parseInt(newModel.age),
          state: newModel.state,
          locationType: newModel.locationType,
          gender: newModel.gender,
          profileImage: profileImageUrl,
          galleryImages: galleryImageUrls,
          plan: newModel.plan,
          bio: newModel.bio,
          whatsappNumber: newModel.whatsapp,
          rates: newModel.rates,
          interests: newModel.interests,
          canTravelTo: newModel.canTravelTo
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create model account');
      }

      const createdModel: Profile = {
        id: result.userId,
        name: newModel.name,
        username: generatedUsername,
        age: parseInt(newModel.age),
        state: newModel.state,
        locationType: newModel.locationType,
        gender: newModel.gender,
        profileImage: profileImageUrl,
        galleryImages: galleryImageUrls,
        isFeatured: false,
        isSubscribed: true,
        status: "active",
        plan: newModel.plan,
        bio: newModel.bio,
        whatsappNumber: newModel.whatsapp,
        canTravelTo: newModel.canTravelTo,
        rates: newModel.rates,
        interests: newModel.interests
      };

      setProfiles(prev => [createdModel, ...prev]);
      setIsCreating(false);
      setShowAddModal(false);
      
      // Reset form
      setNewModel({
        name: "",
        email: "",
        password: "",
        age: "",
        state: "",
        locationType: "national" as "national" | "international",
        gender: "female",
        whatsapp: "",
        bio: "",
        plan: "monthly",
        coverPhoto: null,
        galleryPhotos: [],
        existingProfileImage: "",
        existingGalleryImages: [],
        rates: [
          { service: "SHORT TIME", incall: 0, outcall: 0 },
          { service: "OVER NIGHT", incall: 0, outcall: 0 },
          { service: "WEEKEND", incall: 0, outcall: 0 },
        ],
        interests: [],
        canTravelTo: [],
      });

      alert(`Success!\nModel Account Created and Activated!\nEmail: ${newModel.email}\nThey can log in immediately.`);
    } catch(err: any) {
      alert("Failed to add model: " + err.message);
    }
  };

  const toggleSort = (key: "name" | "state") => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const filteredProfiles = profiles
    .filter(p => {
      const matchesSearch = (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (p.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                          (p.state?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesState = selectedStateFilter === "" || p.state === selectedStateFilter;
      return matchesSearch && matchesState;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      const valA = a[key].toLowerCase();
      const valB = b[key].toLowerCase();
      
      if (direction === "asc") return valA.localeCompare(valB);
      return valB.localeCompare(valA);
    });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-1">Platform oversight & financial management.</p>
          
          <div className="flex items-center gap-1 mt-6 bg-slate-200/50 p-1 rounded-xl w-fit">
            <button 
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${activeTab === 'directory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Directory
            </button>
            <button 
              onClick={() => setActiveTab("financials")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${activeTab === 'financials' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Financials
            </button>
            <button 
              onClick={() => setActiveTab("locations")}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${activeTab === 'locations' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Locations
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add New Model
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex-1 sm:flex-none bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-200 transition active:scale-[0.98]"
            >
              <Sparkles className="w-5 h-5" />
              Analytics
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition active:scale-[0.98] shadow-sm"
              title="Platform Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-3 bg-white border border-red-100 text-red-600 rounded-2xl hover:bg-red-50 transition active:scale-[0.98] shadow-sm"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {activeTab === 'directory' ? stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md group">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        )) : (
          <>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                ₦{transactions.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md group">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Subscriptions</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                ₦{transactions.filter(t => t.type === 'Subscription').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Connection Fees</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">
                ₦{transactions.filter(t => t.type === 'Connection').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
              </h3>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'directory' ? (
          <>
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-xl text-slate-800">Model Directory</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or state..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none w-full sm:w-64 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select 
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-600 transition min-w-[150px]"
            >
              <option value="">All Locations</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap pl-8"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Model Details
                    {sortConfig?.key === "name" && (
                      sortConfig.direction === "asc" ? <ArrowUpRight className="w-3 h-3 rotate-45 text-blue-600" /> : <ArrowUpRight className="w-3 h-3 rotate-[135deg] text-blue-600" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4">Status</th>
                <th 
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
                  onClick={() => toggleSort("state")}
                >
                  <div className="flex items-center gap-2">
                    Location
                    {sortConfig?.key === "state" && (
                      sortConfig.direction === "asc" ? <ArrowUpRight className="w-3 h-3 rotate-45 text-blue-600" /> : <ArrowUpRight className="w-3 h-3 rotate-[135deg] text-blue-600" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4">Plan / Billing</th>
                <th className="px-6 py-4 text-right pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-6 py-4 pl-8">
                    <div className="flex items-center gap-4">
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm border border-slate-100 shrink-0">
                        <img src={getOptimizedUrl(profile.profileImage || PLACEHOLDER_IMAGE)} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-black text-slate-900 leading-tight">{profile.name}</p>
                          {profile.isFeatured && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">@{profile.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${
                      profile.status === "active" ? "bg-green-50 text-green-700 border-green-100" : profile.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-red-50 text-red-700 border-red-100"
                    }`}>
                      {profile.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : profile.status === 'pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {profile.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {profile.state}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 leading-none mb-1">₦{profile.plan === 'monthly' ? platformSettings.monthlySubPrice.toLocaleString() : platformSettings.weeklySubPrice.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter opacity-70">{profile.plan} Plan</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEditProfile(profile)}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 rounded-xl transition shadow-sm"
                        title="Edit Profile"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setProfiles(prev => prev.map(p => p.id === profile.id ? {...p, isFeatured: !p.isFeatured} : p));
                        }}
                        className={`p-2.5 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm ${profile.isFeatured ? 'text-amber-500 border-amber-200 bg-amber-50/50' : 'text-slate-400 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50/50'}`}
                      >
                        <Sparkles className="w-5 h-5" />
                      </button>
                      {profile.status !== 'active' ? (
                        <button 
                          onClick={() => profile.status === 'pending' ? handleApprove(profile.id) : handleActivate(profile.id)}
                          className="p-2.5 bg-white border border-slate-200 text-green-600 hover:bg-green-50 hover:border-green-200 rounded-xl transition shadow-sm"
                          title="Activate Account"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDeactivate(profile.id)}
                          className="p-2.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition shadow-sm"
                          title="Suspend Account"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredProfiles.map((profile) => (
            <div key={profile.id} className="p-5 hover:bg-slate-50 transition active:bg-slate-100/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <img src={getOptimizedUrl(profile.profileImage || PLACEHOLDER_IMAGE)} alt={profile.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-slate-900 leading-tight">{profile.name}</h4>
                      {profile.isFeatured && <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">@{profile.username} • {profile.age} yrs</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                  profile.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : profile.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {profile.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-600 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {profile.state}
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-300" />
                  ₦{profile.plan === 'monthly' ? platformSettings.monthlySubPrice.toLocaleString() : platformSettings.weeklySubPrice.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditProfile(profile)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-[0.98] transition"
                >
                  Edit Profile
                </button>
                <button 
                  onClick={() => profile.status === 'active' ? handleDeactivate(profile.id) : profile.status === 'pending' ? handleApprove(profile.id) : handleActivate(profile.id)}
                  className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm active:scale-[0.98] transition ${
                    profile.status === 'active' 
                      ? 'bg-red-50 text-red-600 border border-red-100' 
                      : 'bg-green-600 text-white border border-green-700'
                  }`}
                >
                  {profile.status === 'active' ? 'Suspend' : profile.status === 'pending' ? 'Approve' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>

          </>
        ) : activeTab === 'financials' ? (
          <div className="bg-white min-h-[400px]">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-xl text-slate-800">Transaction History</h2>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">
                  <History className="w-4 h-4" />
                  Log
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Payer / Model</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition">
                            <Receipt className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">{tx.id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{tx.type}</span>
                          {tx.plan && <span className="text-[10px] text-slate-400 uppercase font-black tracking-tight">{tx.plan} Plan</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{tx.user_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="text-sm font-black text-slate-900 italic">₦{tx.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 align-middle">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider border border-green-100">
                          <Check className="w-3 h-3" />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <p>Showing {transactions.length} transactions</p>
              <button className="text-blue-600 font-bold hover:underline">View Full Financial Report →</button>
            </div>
          </div>
        ) : (
          <div className="bg-white min-h-[400px]">
             <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-xl text-slate-800">Custom Locations</h2>
              <p className="text-sm text-slate-500 font-medium">Add countries or states that are missing from the default lists.</p>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Add Location Form */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] mb-4">Add New Location</h3>
                  <form onSubmit={handleAddLocation} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="E.g. Port Harcourt"
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                      <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-2xl border border-slate-200">
                        <button 
                          type="button"
                          onClick={() => setNewLocType('national')}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newLocType === 'national' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          Nigeria
                        </button>
                        <button 
                          type="button"
                          onClick={() => setNewLocType('international')}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newLocType === 'international' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          Intl
                        </button>
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isAddingLoc || !newLocName.trim()}
                      className="w-full bg-navy text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-navy/20 hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
                    >
                      {isAddingLoc ? "Saving..." : "Save Location"}
                    </button>
                  </form>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 italic text-sm text-blue-700">
                  <p>Added locations will appear in the filter dropdowns and registration forms for all users.</p>
                </div>
              </div>

              {/* Locations List */}
              <div className="lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Nigeria (National) */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
                      <MapPinIcon className="w-3 h-3 text-blue-600" />
                      Custom Nigeria States
                    </h3>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] overflow-hidden">
                      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {customLocations.filter(l => l.type === 'national').length > 0 ? (
                          customLocations.filter(l => l.type === 'national').map(loc => (
                            <div key={loc.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 group">
                              <span className="text-sm font-bold text-slate-700">{loc.name}</span>
                              <button 
                                onClick={() => handleDeleteLocation(loc.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <p className="text-xs text-slate-400 font-medium">No custom states added.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* International */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2">
                      <Globe className="w-3 h-3 text-blue-600" />
                      Custom Intl Countries
                    </h3>
                    <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] overflow-hidden">
                      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {customLocations.filter(l => l.type === 'international').length > 0 ? (
                          customLocations.filter(l => l.type === 'international').map(loc => (
                            <div key={loc.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 group">
                              <span className="text-sm font-bold text-slate-700">{loc.name}</span>
                              <button 
                                onClick={() => handleDeleteLocation(loc.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <p className="text-xs text-slate-400 font-medium">No custom countries added.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADD MODEL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !isCreating && setShowAddModal(false)} />
          
          <div className="relative bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh]">

            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">MANUAL ONBOARDING</h2>
                <p className="text-slate-500 text-sm">Add a model and set their default password.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Identity Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> 01. Identity details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="model@example.com"
                      value={newModel.email}
                      onChange={e => setNewModel({...newModel, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Default Password</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Set a password"
                      value={newModel.password}
                      onChange={e => setNewModel({...newModel, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="E.g. Amara Okafor"
                      value={newModel.name}
                      onChange={e => setNewModel({...newModel, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Age</label>
                    <input 
                      required
                      type="number" 
                      placeholder="24"
                      value={newModel.age}
                      onChange={e => setNewModel({...newModel, age: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Gender</label>
                    <select 
                      required
                      value={newModel.gender}
                      onChange={e => setNewModel({...newModel, gender: e.target.value as "male" | "female"})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Region</label>
                    <select 
                      required
                      value={newModel.locationType}
                      onChange={e => setNewModel({...newModel, locationType: e.target.value as "national" | "international", state: ""})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none"
                    >
                      <option value="national">Nigeria</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-700">Location</label>
                      <button 
                        type="button"
                        onClick={openQuickAdd}
                        className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter hover:bg-blue-700 transition shadow-sm"
                      >
                        + add
                      </button>
                    </div>
                    <select 
                      required
                      value={newModel.state}
                      onChange={e => setNewModel({...newModel, state: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none"
                    >
                      <option value="">Select Location</option>
                      {getMergedStates(newModel.locationType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">WhatsApp Number</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="+234..."
                      value={newModel.whatsapp}
                      onChange={e => setNewModel({...newModel, whatsapp: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Bio / Description</label>
                  <textarea 
                    placeholder="Tell us a bit about the model..."
                    value={newModel.bio}
                    onChange={e => setNewModel({...newModel, bio: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition resize-none"
                  />
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> 02. Media Assets
                </h3>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                  <span className="text-sm">⚠️</span>
                  <p className="text-[11px] text-amber-700 font-medium leading-snug">
                    <span className="font-black">1MB limit per image.</span> Compress photos at <a href="https://squoosh.app" target="_blank" rel="noreferrer" className="underline font-black">squoosh.app</a> before uploading.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-700 ml-1 block mb-2">Cover Photo</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden group">
                      {newModel.coverPhoto ? (
                        <div className="absolute inset-0 bg-blue-600 text-white flex flex-col items-center justify-center p-4">
                          <ImageIcon className="w-8 h-8 mb-2" />
                          <p className="text-[10px] font-bold truncate w-full text-center">{newModel.coverPhoto.name}</p>
                          <button onClick={(e) => { e.preventDefault(); setNewModel({...newModel, coverPhoto: null})}} className="mt-2 bg-white/20 hover:bg-white/40 p-1 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-1 group-hover:scale-110 transition" />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Click to upload</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={e => {
                        if(e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 1 * 1024 * 1024) { alert(`"${file.name}" exceeds 1MB. Please compress it first.`); return; }
                          setNewModel({...newModel, coverPhoto: file});
                        }
                      }} />
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 ml-1 block mb-2">Gallery (Min. 3)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition group">
                      <div className="text-center p-4">
                        <Plus className="w-8 h-8 mx-auto text-slate-400 mb-1 group-hover:scale-110 transition" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{newModel.galleryPhotos.length} / 3 selected</p>
                      </div>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={e => {
                        if(e.target.files) {
                          const all = Array.from(e.target.files);
                          const oversized = all.filter(f => f.size > 1 * 1024 * 1024);
                          if (oversized.length > 0) { alert(`${oversized.map(f => `"${f.name}"`).join(', ')} exceed 1MB. Please compress them first.`); }
                          const valid = all.filter(f => f.size <= 1 * 1024 * 1024);
                          if (valid.length > 0) setNewModel({...newModel, galleryPhotos: [...newModel.galleryPhotos, ...valid]});
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* Rate Card Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> 03. Rate Card (NGN)
                </h3>
                <div className="space-y-3">
                  {newModel.rates.map((rate, idx) => (
                    <div key={rate.service} className="grid grid-cols-3 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{rate.service}</div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₦</span>
                        <input 
                          type="number" 
                          value={rate.incall || ""}
                          onChange={(e) => {
                            const newRates = [...newModel.rates];
                            newRates[idx].incall = parseInt(e.target.value) || 0;
                            setNewModel({...newModel, rates: newRates});
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="Incall"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₦</span>
                        <input 
                          type="number" 
                          value={rate.outcall || ""}
                          onChange={(e) => {
                            const newRates = [...newModel.rates];
                            newRates[idx].outcall = parseInt(e.target.value) || 0;
                            setNewModel({...newModel, rates: newRates});
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                          placeholder="Outcall"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> 04. Services & Interests (I am into)
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[40px]">
                    {newModel.interests.length > 0 ? newModel.interests.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                        {interest}
                        <button type="button" onClick={() => setNewModel(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-[10px] text-slate-400 italic">No interests selected.</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 h-48 overflow-y-auto p-2 border border-slate-100 rounded-xl custom-scrollbar-rich">
                    {INTERESTS_LIST.map(interest => {
                      const isSelected = newModel.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewModel(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                            } else {
                              setNewModel(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                            }
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Travel Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> 05. Travel Destinations (I can travel to)
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 min-h-[40px]">
                    {newModel.canTravelTo.length > 0 ? newModel.canTravelTo.map(dest => (
                      <span key={dest} className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                        {dest}
                        <button type="button" onClick={() => setNewModel(prev => ({ ...prev, canTravelTo: prev.canTravelTo.filter(d => d !== dest) }))} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-[10px] text-slate-400 italic">No destinations selected.</span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search destinations..." 
                      value={destinationSearch}
                      onChange={e => setDestinationSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 h-48 overflow-y-auto p-2 border border-slate-100 rounded-xl custom-scrollbar-rich">
                    {getMergedStates(newModel.locationType)
                      .filter(dest => dest.toLowerCase().includes(destinationSearch.toLowerCase()))
                      .map(dest => {
                      const isSelected = newModel.canTravelTo.includes(dest);
                      return (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewModel(prev => ({ ...prev, canTravelTo: prev.canTravelTo.filter(d => d !== dest) }));
                            } else {
                              setNewModel(prev => ({ ...prev, canTravelTo: [...prev.canTravelTo, dest] }));
                            }
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                        >
                          {dest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-6 h-px bg-slate-200"></span> 06. Account & Subscription
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm font-black text-blue-900 tracking-tight">Access Plan</p>
                      <p className="text-xs text-blue-600/80">Select their starting visibility plan.</p>
                    </div>
                    <div className="flex bg-white rounded-xl p-1 shadow-sm border border-blue-100">
                      <button 
                        type="button"
                        onClick={() => setNewModel({...newModel, plan: 'weekly'})}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${newModel.plan === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-600'}`}
                      >
                        Weekly
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewModel({...newModel, plan: 'monthly'})}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition ${newModel.plan === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-blue-600'}`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Bypass Payment</p>
                      <p className="text-xs text-blue-600/70 leading-relaxed mt-1">Admin creation automatically marks the account as <strong>Active</strong>. No transaction will be processed.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-green-900">Securely creating Auth user and activating membership profile.</p>
                </div>
              </div>

              <div className="pt-4 sticky bottom-0 bg-white">
                <button 
                  disabled={isCreating}
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition flex justify-center items-center gap-3 disabled:opacity-50 transform active:scale-[0.98]"
                >
                  {isCreating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>CREATE MODEL ACCOUNT <ArrowUpRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODEL MODAL */}
      {showEditModal && editingProfile && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowEditModal(false)} />
          
          <div className="relative bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300 flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight text-blue-600">EDIT MODEL ACCOUNT</h2>
                <p className="text-slate-500 text-sm">Modify profile details or change plan.</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateModel} className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Full Name</label>
                    <input required type="text" value={newModel.name} onChange={e => setNewModel({...newModel, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Age</label>
                    <input required type="number" value={newModel.age} onChange={e => setNewModel({...newModel, age: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Gender</label>
                    <select required value={newModel.gender} onChange={e => setNewModel({...newModel, gender: e.target.value as "male" | "female"})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none">
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">Region</label>
                    <select 
                      required
                      value={newModel.locationType}
                      onChange={e => setNewModel({...newModel, locationType: e.target.value as "national" | "international", state: ""})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none"
                    >
                      <option value="national">Nigeria</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-slate-700">Location</label>
                      <button 
                        type="button"
                        onClick={openQuickAdd}
                        className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter hover:bg-blue-700 transition shadow-sm"
                      >
                        + add
                      </button>
                    </div>
                    <select required value={newModel.state} onChange={e => setNewModel({...newModel, state: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition appearance-none">
                      <option value="">Select Location</option>
                      {getMergedStates(newModel.locationType).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 ml-1">WhatsApp Number</label>
                    <input required type="tel" value={newModel.whatsapp} onChange={e => setNewModel({...newModel, whatsapp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 ml-1">Bio / Description</label>
                  <textarea 
                    value={newModel.bio} 
                    onChange={e => setNewModel({...newModel, bio: e.target.value})} 
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 transition resize-none" 
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-sm font-black text-slate-900 tracking-tight mb-4 uppercase tracking-widest text-[10px] text-slate-400">Rate Card Management (NGN)</p>
                <div className="space-y-3">
                  {newModel.rates.map((rate, idx) => (
                    <div key={rate.service} className="grid grid-cols-3 gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-black text-slate-500 uppercase">{rate.service}</div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₦</span>
                        <input 
                          type="number" 
                          value={rate.incall || ""}
                          onChange={(e) => {
                            const newRates = [...newModel.rates];
                            newRates[idx].incall = parseInt(e.target.value) || 0;
                            setNewModel({...newModel, rates: newRates});
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">₦</span>
                        <input 
                          type="number" 
                          value={rate.outcall || ""}
                          onChange={(e) => {
                            const newRates = [...newModel.rates];
                            newRates[idx].outcall = parseInt(e.target.value) || 0;
                            setNewModel({...newModel, rates: newRates});
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests Section - Edit */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-sm font-black text-slate-900 tracking-tight mb-4 uppercase tracking-widest text-[10px] text-slate-400">Services & Interests (I am into)</p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-200 min-h-[40px]">
                    {newModel.interests.length > 0 ? newModel.interests.map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                        {interest}
                        <button type="button" onClick={() => setNewModel(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-[10px] text-slate-400 italic">No interests selected.</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white custom-scrollbar-rich">
                    {INTERESTS_LIST.map(interest => {
                      const isSelected = newModel.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewModel(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
                            } else {
                              setNewModel(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                            }
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Travel Section - Edit */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-sm font-black text-slate-900 tracking-tight mb-4 uppercase tracking-widest text-[10px] text-slate-400">Travel Destinations (I can travel to)</p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-200 min-h-[40px]">
                    {newModel.canTravelTo.length > 0 ? newModel.canTravelTo.map(dest => (
                      <span key={dest} className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                        {dest}
                        <button type="button" onClick={() => setNewModel(prev => ({ ...prev, canTravelTo: prev.canTravelTo.filter(d => d !== dest) }))} className="text-slate-400 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )) : (
                      <span className="text-[10px] text-slate-400 italic">No destinations selected.</span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search destinations..." 
                      value={destinationSearch}
                      onChange={e => setDestinationSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 h-48 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-white custom-scrollbar-rich">
                    {getMergedStates(newModel.locationType)
                      .filter(dest => dest.toLowerCase().includes(destinationSearch.toLowerCase()))
                      .map(dest => {
                      const isSelected = newModel.canTravelTo.includes(dest);
                      return (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewModel(prev => ({ ...prev, canTravelTo: prev.canTravelTo.filter(d => d !== dest) }));
                            } else {
                              setNewModel(prev => ({ ...prev, canTravelTo: [...prev.canTravelTo, dest] }));
                            }
                          }}
                          className={`text-left px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-slate-50'}`}
                        >
                          {dest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-sm font-black text-slate-900 tracking-tight mb-4">Subscription Override</p>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-200">
                  <button type="button" onClick={() => setNewModel({...newModel, plan: 'weekly'})} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition ${newModel.plan === 'weekly' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Weekly</button>
                  <button type="button" onClick={() => setNewModel({...newModel, plan: 'monthly'})} className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition ${newModel.plan === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Monthly</button>
                </div>
              </div>

              {/* MEDIA MANAGEMENT SECTION */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <span className="w-6 h-px bg-slate-200"></span> Profile Image
                  </h3>
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 group">
                    <img 
                      src={getOptimizedUrl(newModel.coverPhoto ? URL.createObjectURL(newModel.coverPhoto) : (newModel.existingProfileImage || PLACEHOLDER_IMAGE))} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                    <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                      <Plus className="w-6 h-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={e => { if(e.target.files) setNewModel({...newModel, coverPhoto: e.target.files[0]})}} />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-px bg-slate-200"></span> Portfolio Gallery
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {/* Existing Images */}
                    {newModel.existingGalleryImages.map((img, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={getOptimizedUrl(img || PLACEHOLDER_IMAGE)} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                        <button 
                          type="button"
                          onClick={() => setNewModel({...newModel, existingGalleryImages: newModel.existingGalleryImages.filter((_, i) => i !== idx)})}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {/* New Uploads */}
                    {newModel.galleryPhotos.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group ring-2 ring-blue-600">
                        <img src={getOptimizedUrl(URL.createObjectURL(file))} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                        <button 
                          type="button"
                          onClick={() => setNewModel({...newModel, galleryPhotos: newModel.galleryPhotos.filter((_, i) => i !== idx)})}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {/* Add Button */}
                    <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                      <Plus className="w-6 h-6 text-slate-400" />
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        accept="image/*" 
                        onChange={e => { if(e.target.files) setNewModel({...newModel, galleryPhotos: [...newModel.galleryPhotos, ...Array.from(e.target.files)]})}} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition">Update Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANALYTICS SIDE PANEL */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsAnalyticsOpen(false)} />
          <div className="relative w-full sm:max-w-sm bg-white h-full shadow-2xl p-6 sm:p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">ANALYTICS</h2>
              <button onClick={() => setIsAnalyticsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition"><X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-8">
              {/* State Distribution */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-px bg-slate-200"></span> Distribution by State
                </h3>
                <div className="space-y-3">
                  {Array.from(new Set(profiles.map(p => p.state))).map(state => {
                    const count = profiles.filter(p => p.state === state).length;
                    const percentage = (count / profiles.length) * 100;
                    return (
                      <div key={state} className="space-y-1.5">
                        <div className="flex justify-between text-sm font-bold text-slate-700">
                          <span>{state}</span>
                          <span>{count} Models</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-6 h-px bg-slate-200"></span> Status Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-black text-green-600 uppercase">Active</p>
                    <p className="text-2xl font-black text-green-700">{profiles.filter(p => p.status === 'active').length}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black text-red-600 uppercase">Suspended</p>
                    <p className="text-2xl font-black text-red-700">{profiles.filter(p => p.status === 'suspended').length}</p>
                  </div>
                </div>
              </div>

              {/* Plan Breakdown */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <span className="w-6 h-px bg-slate-200"></span> Plan performance
                </h3>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Monthly Tier</span>
                    <span className="px-3 py-1 bg-white rounded-lg text-xs font-black text-blue-600 shadow-sm">{profiles.filter(p => p.plan === 'monthly').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Weekly Tier</span>
                    <span className="px-3 py-1 bg-white rounded-lg text-xs font-black text-blue-600 shadow-sm">{profiles.filter(p => p.plan === 'weekly').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLATFORM SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsOpen(false)} />
          
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  PLATFORM SETTINGS
                </h2>
                <p className="text-slate-500 text-xs mt-1">Configure global pricing for all services.</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekly Subscription (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                    <input 
                      type="number" 
                      value={platformSettings.weeklySubPrice}
                      onChange={(e) => setPlatformSettings({...platformSettings, weeklySubPrice: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Subscription (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                    <input 
                      type="number" 
                      value={platformSettings.monthlySubPrice}
                      onChange={(e) => setPlatformSettings({...platformSettings, monthlySubPrice: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Connection Fee (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
                    <input 
                      type="number" 
                      value={platformSettings.connectionFee}
                      onChange={(e) => setPlatformSettings({...platformSettings, connectionFee: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-3 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-blue-600" />
                    Manage Locations
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      <input 
                        type="text"
                        placeholder="New location name..."
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600 transition"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={newLocType}
                          onChange={(e) => setNewLocType(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-600 transition"
                        >
                          <option value="national">Nigeria</option>
                          <option value="international">Intl</option>
                        </select>
                        <button 
                          onClick={handleAddLocation}
                          disabled={isAddingLoc || !newLocName.trim()}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          Add Location
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[150px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {customLocations.map(loc => (
                        <div key={loc.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${loc.type === 'national' ? 'bg-green-500' : 'bg-blue-500'}`} />
                            <span className="text-xs font-bold text-slate-700">{loc.name}</span>
                          </div>
                          <button onClick={() => handleDeleteLocation(loc.id)} className="p-1 text-slate-300 hover:text-red-500 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 h-fit">
                    <Sparkles className="w-4 h-4 ml-0.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-900 uppercase">Live Preview</h4>
                    <p className="text-[10px] text-blue-700/70 mt-1 leading-relaxed">
                      Models will pay <span className="font-bold">₦{platformSettings.monthlySubPrice.toLocaleString()}</span> for full month access. 
                      Users will pay <span className="font-bold">₦{platformSettings.connectionFee.toLocaleString()}</span> per connection.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                disabled={isSavingSettings}
                onClick={async () => {
                  setIsSavingSettings(true);
                  try {
                    const { error } = await supabase
                      .from("platform_settings")
                      .upsert({
                        id: "global",
                        weekly_sub_price: platformSettings.weeklySubPrice,
                        monthly_sub_price: platformSettings.monthlySubPrice,
                        connection_fee: platformSettings.connectionFee,
                        updated_at: new Date().toISOString()
                      });

                    if (error) throw error;
                    
                    setIsSettingsOpen(false);
                    alert("Platform settings saved successfully!");
                  } catch (err: any) {
                    alert("Error saving settings: " + err.message);
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
              >
                {isSavingSettings ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD LOCATION MODAL */}
      {showQuickAddLoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowQuickAddLoc(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px]">Quick Add Location</h3>
              <button onClick={() => setShowQuickAddLoc(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Name</label>
                <input 
                  required
                  type="text"
                  placeholder="E.g. Port Harcourt"
                  value={newLocName}
                  onChange={(e) => setNewLocName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
                  <button 
                    type="button"
                    onClick={() => setNewLocType('national')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newLocType === 'national' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Nigeria
                  </button>
                  <button 
                    type="button"
                    onClick={() => setNewLocType('international')}
                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${newLocType === 'international' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Intl
                  </button>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 px-1 italic">
                  Note: International locations only appear when "International" is selected as the Region.
                </p>
              </div>
              <button 
                onClick={async () => {
                  await handleAddLocation({ preventDefault: () => {} } as any);
                  setShowQuickAddLoc(false);
                }}
                disabled={isAddingLoc || !newLocName.trim()}
                className="w-full bg-navy text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-navy/20 active:scale-95 transition disabled:opacity-50"
              >
                {isAddingLoc ? "Saving..." : "Save Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

