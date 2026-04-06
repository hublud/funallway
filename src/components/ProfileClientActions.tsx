"use client";

import { useState } from "react";
import ConnectModal from "./ConnectModal";
import { Profile } from "@/lib/mockData";
import { MessageCircle } from "lucide-react";

export default function ProfileClientActions({ profile }: { profile: Profile }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:scale-[0.98] active:opacity-90 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 text-lg transform hover:-translate-y-1"
      >
        <MessageCircle className="w-5 h-5" />
        Connect Now
      </button>

      <ConnectModal 
        profile={profile} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
