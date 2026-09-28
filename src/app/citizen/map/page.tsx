"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmergencyMap } from "@/components/map/EmergencyMap";
import { Radio } from "lucide-react";
import { EmergencyRequestData } from "@/types";

export default function CitizenMapPage() {
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);

  useEffect(() => {
    fetch("/api/requests?limit=40")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setRequests(data.data.requests || []);
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar role="CITIZEN" />

        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-8 min-w-0">
          <div className="mb-4">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Radio className="w-6 h-6 text-red-600 animate-pulse" />
              <span>Community Emergency Map</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live operational view of local emergency needs and dispatched relief supplies
            </p>
          </div>

          <EmergencyMap requests={requests} height="calc(100vh - 12rem)" />
        </main>
      </div>

      <BottomNav role="CITIZEN" />
    </div>
  );
}
