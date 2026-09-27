"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmergencyMap } from "@/components/map/EmergencyMap";
import { Radio, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmergencyRequestData } from "@/types";

export default function AdminMapPage() {
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);

  const fetchMapData = async () => {
    try {
      const res = await fetch("/api/requests?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Radio className="w-6 h-6 text-red-600 animate-pulse" />
                <span>Tactical Crisis Map (Command Grid)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time geographic distribution of all emergency requests and response logistics
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={fetchMapData}
            >
              Refresh Pins
            </Button>
          </div>

          <EmergencyMap requests={requests} height="calc(100vh - 12rem)" />
        </main>
      </div>

      <BottomNav role="ADMIN" />
    </div>
  );
}
