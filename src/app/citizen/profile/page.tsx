"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { User, Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";
import { UserSummary } from "@/types";

export default function CitizenProfilePage() {
  const [user, setUser] = useState<UserSummary | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) setUser(data.data.user);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="CITIZEN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
              Citizen Profile & Emergency Settings
            </h1>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
                  {user?.name?.charAt(0) || "C"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{user?.name || "Citizen"}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                    <Heart className="w-3 h-3 text-blue-600" />
                    <span>Registered Community Member</span>
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Phone</span>
                    <span className="font-semibold text-slate-800">{user?.phone || "+1 (555) 234-5678"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Primary Neighborhood</span>
                    <span className="font-semibold text-slate-800">{user?.address || "Financial District, San Francisco"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-slate-700 leading-relaxed">
                <p className="font-bold text-blue-900 mb-1">Emergency Privacy Notice</p>
                Your exact street address is only shared with an assigned community volunteer once they accept your emergency request.
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="CITIZEN" />
    </div>
  );
}
