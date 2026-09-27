"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import {
  ShieldCheck,
  Power,
  MapPin,
  Truck,
  Check,
  AlertTriangle,
  Award,
} from "lucide-react";
import { ResourceType, UserSummary, VolunteerProfileData } from "@/types";
import { toast } from "sonner";

export default function VolunteerProfilePage() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<VolunteerProfileData | null>(null);
  const [capabilities, setCapabilities] = useState<ResourceType[]>(["WATER", "FOOD"]);
  const [radius, setRadius] = useState(10);
  const [vehicle, setVehicle] = useState("SUV / Car");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setUser(data.data.user);
          const p = data.data.user.volunteerProfile;
          if (p) {
            setProfile(p);
            setRadius(p.serviceRadiusKm || 10);
            setVehicle(p.vehicleType || "SUV / Car");
            setBio(p.bio || "");
            try {
              setCapabilities(JSON.parse(p.capabilities));
            } catch {
              setCapabilities(["WATER", "FOOD"]);
            }
          }
        }
      });
  }, []);

  const toggleCap = (cap: ResourceType) => {
    if (capabilities.includes(cap)) {
      if (capabilities.length === 1) {
        toast.warning("Keep at least one capability selected");
        return;
      }
      setCapabilities(capabilities.filter((c) => c !== cap));
    } else {
      setCapabilities([...capabilities, cap]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/volunteers/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilities,
          serviceRadiusKm: Number(radius),
          vehicleType: vehicle,
          bio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Volunteer dispatch settings updated");
      } else {
        toast.error(data.error.message || "Failed to update profile");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
              Volunteer Dispatch Profile & Logistics Settings
            </h1>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header Profile Badge */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl">
                  {user?.name?.charAt(0) || "V"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {profile?.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Responder</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Verification In Review</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Rating: {profile?.rating || 5.0} / 5.0 • {profile?.completedAssignments || 0} completed missions</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Settings */}
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Resource Capabilities (What you can supply or transport)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "WATER", label: "Clean Drinking Water" },
                      { id: "FOOD", label: "Emergency Food" },
                      { id: "TRANSPORT", label: "Relocation Transport" },
                      { id: "SHELTER", label: "Shelter Gear" },
                      { id: "OTHER", label: "General Supplies" },
                    ].map((c) => {
                      const isSelected = capabilities.includes(c.id as ResourceType);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCap(c.id as ResourceType)}
                          className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all ${
                            isSelected
                              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Operational Radius: <span className="text-blue-600 font-mono">{radius} km</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={35}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full accent-blue-600 mt-2"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      The matching algorithm only dispatches requests within this radius.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Vehicle Capacity
                    </label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
                    >
                      <option value="SUV / 4x4">SUV / 4x4</option>
                      <option value="Cargo Van">Cargo Van</option>
                      <option value="Pickup Truck">Pickup Truck</option>
                      <option value="Sedan / Hatchback">Sedan / Hatchback</option>
                      <option value="Bicycle / Foot">Bicycle / Foot</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Bio & Certifications
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="CERT trained, first aid responder, cargo van capacity..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="font-semibold"
                  isLoading={isSaving}
                >
                  Save Dispatch Settings
                </Button>
              </form>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="VOLUNTEER" />
    </div>
  );
}
