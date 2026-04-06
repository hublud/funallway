export interface Rate {
  service: string;
  incall: number;
  outcall: number;
}

export interface Profile {
  id: string;
  name: string;
  username: string;
  age: number;
  gender: "male" | "female";
  locationType: "national" | "international";
  state: string;
  bio: string;
  profileImage: string;
  galleryImages: string[];
  isFeatured: boolean;
  isSubscribed: boolean;
  status: "active" | "suspended" | "pending";
  plan: "weekly" | "monthly";
  whatsappNumber: string;
  canTravelTo: string[];
  rates?: Rate[];
  interests?: string[];
}

export const INTERESTS_LIST = [
  "Attending corporate parties",
  "Beach parties",
  "Being Filmed",
  "Blow Job",
  "Body Worship",
  "COB (Cum on body)",
  "COF (Cum on face)",
  "Couples",
  "DFK (Deep french kissing)",
  "Dinner Dates",
  "Domestic carer",
  "Domination (giving)",
  "Erotic massage",
  "Erotic Spanking (giving)",
  "Erotic Spanking (receiving)",
  "Face Sitting",
  "Female Stripper",
  "Food Play",
  "French Kissing",
  "Gang Bang",
  "GFE (Girlfriend experience)",
  "Hand Job",
  "Lap dancing",
  "Massage",
  "MMF 3somes",
  "Modelling",
  "O-Level (Oral sex)",
  "Oral with condom",
  "OWO (Oral without condom)",
  "Parties (Mandatory sex parties)",
  "Pegging",
  "Preparing a meal",
  "Prostrate Massage",
  "PSE (Porn Star Experience)",
  "Receiving Oral",
  "Rimming (giving)",
  "Rimming (receiving)",
  "Role Play & Fantasy",
  "Sex toys",
  "Swinging",
  "Tantric Massage",
  "Threesome",
  "Travel Companion",
  "Humiliation (giving)",
  "Smoking (Fetish)",
  "Bondage",
  "Watersports (receiving)",
  "69 (69 sex position)",
  "Anal Rimming (Licking anus)",
  "CIM (Cum in mouth)",
].sort();

export const mockProfiles: Profile[] = [
  {
    id: "1",
    name: "Amara",
    username: "amara_baby",
    age: 23,
    gender: "female",
    locationType: "national",
    state: "Lagos",
    bio: "Love traveling and exploring new places. Looking for someone adventurous!",
    profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop"
    ],
    isFeatured: true,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000001",
    canTravelTo: ["Abuja", "Rivers"],
    rates: [
      { service: "WEEKEND", incall: 250000, outcall: 300000 }
    ],
    interests: ["GFE (Girlfriend experience)", "Dinner Dates", "French Kissing", "Massage"]
  },
  {
    id: "2",
    name: "Chioma",
    username: "chi_chi",
    age: 25,
    gender: "female",
    locationType: "national",
    state: "Abuja",
    bio: "Quiet and reserved. Enjoy reading and deep conversations.",
    profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: false,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000002",
    canTravelTo: ["Kano"],
    rates: [
      { service: "WEEKEND", incall: 200000, outcall: 250000 }
    ],
    interests: ["Blow Job", "Hand Job", "Role Play & Fantasy", "Sex toys"]
  },
  {
    id: "7",
    name: "David",
    username: "david_l",
    age: 28,
    gender: "male",
    locationType: "national",
    state: "Lagos",
    bio: "Fitness trainer. Love taking care of my body and providing the best GFE.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: true,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000007",
    canTravelTo: ["Abuja", "Oyo"],
    rates: [
      { service: "WEEKEND", incall: 150000, outcall: 200000 }
    ],
    interests: ["Massage", "Modelling", "Travel Companion", "Role Play & Fantasy"]
  },
  {
    id: "3",
    name: "Zainab",
    username: "zainab_k",
    age: 22,
    gender: "female",
    locationType: "national",
    state: "Kano",
    bio: "Foodie and entrepreneur. Let's talk business and pleasure.",
    profileImage: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: true,
    isSubscribed: true,
    status: "active",
    plan: "weekly",
    whatsappNumber: "2348000000003",
    canTravelTo: [],
    rates: [
      { service: "SHORT TIME", incall: 35000, outcall: 50000 },
      { service: "OVER NIGHT", incall: 90000, outcall: 120000 },
      { service: "WEEKEND", incall: 180000, outcall: 220000 }
    ],
    interests: ["Being Filmed", "Blow Job", "Dinner Dates", "Erotic massage"]
  },
  {
    id: "8",
    name: "Emma",
    username: "ebube_e",
    age: 26,
    gender: "male",
    locationType: "international",
    state: "United Arab Emirates (Dubai)",
    bio: "Tech bro and traveler. Looking for meaningful connections across the globe.",
    profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: false,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000008",
    canTravelTo: ["Lagos", "Enugu"],
    rates: [
      { service: "SHORT TIME", incall: 45000, outcall: 65000 },
      { service: "OVER NIGHT", incall: 110000, outcall: 140000 },
      { service: "WEEKEND", incall: 220000, outcall: 280000 }
    ],
    interests: ["Body Worship", "Couples", "Dinner Dates", "Travel Companion"]
  },
  {
    id: "4",
    name: "Blessing",
    username: "bless_good",
    age: 26,
    gender: "female",
    locationType: "national",
    state: "Rivers",
    bio: "Fun-loving, energetic. Always down for a good time.",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: false,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000004",
    canTravelTo: ["Lagos", "Enugu", "Delta"],
    rates: [
      { service: "SHORT TIME", incall: 40000, outcall: 55000 },
      { service: "OVER NIGHT", incall: 95000, outcall: 115000 },
      { service: "WEEKEND", incall: 190000, outcall: 230000 }
    ],
    interests: ["DFK (Deep french kissing)", "Face Sitting", "Food Play", "Lap dancing"]
  },
  {
    id: "5",
    name: "Fatima",
    username: "fatima_art",
    age: 24,
    gender: "female",
    locationType: "national",
    state: "Kaduna",
    bio: "Art lover. Museum dates are my favorite.",
    profileImage: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=500&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop"
    ],
    isFeatured: false,
    isSubscribed: true,
    status: "active",
    plan: "monthly",
    whatsappNumber: "2348000000005",
    canTravelTo: ["Abuja", "Lagos"],
    rates: [
      { service: "SHORT TIME", incall: 38000, outcall: 50000 },
      { service: "OVER NIGHT", incall: 85000, outcall: 105000 },
      { service: "WEEKEND", incall: 175000, outcall: 210000 }
    ],
    interests: ["PSE (Porn Star Experience)", "Role Play & Fantasy", "Swinging", "Tantric Massage"]
  },
  {
    id: "6",
    name: "Grace",
    username: "grace_dev",
    age: 27,
    gender: "female",
    locationType: "national",
    state: "Enugu",
    bio: "Software developer by day, gamer by night.",
    profileImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop",
    galleryImages: [],
    isFeatured: true,
    isSubscribed: true,
    status: "active",
    plan: "weekly",
    whatsappNumber: "2348000000006",
    canTravelTo: [],
    rates: [
      { service: "SHORT TIME", incall: 40000, outcall: 55000 },
      { service: "OVER NIGHT", incall: 90000, outcall: 110000 },
      { service: "WEEKEND", incall: 180000, outcall: 220000 }
    ],
    interests: ["Modelling", "Parties (Mandatory sex parties)", "Sex toys", "69 (69 sex position)"]
  }
];
