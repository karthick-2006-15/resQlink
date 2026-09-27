"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, HeartHandshake, ShieldCheck, Mail, Lock, User, Phone, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { ResourceType } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CITIZEN" | "VOLUNTEER">("CITIZEN");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Volunteer Fields
  const [capabilities, setCapabilities] = useState<ResourceType[]>(["WATER", "FOOD"]);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(10);
  const [vehicleType, setVehicleType] = useState("SUV / Car");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const toggleCapability = (cap: ResourceType) => {
    if (capabilities.includes(cap)) {
      if (capabilities.length === 1) {
        toast.warning("At least one resource capability must be selected");
        return;
      }
      setCapabilities(capabilities.filter((c) => c !== cap));
    } else {
      setCapabilities([...capabilities, cap]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in required fields (Name, Email, Password)");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          address,
          capabilities,
          serviceRadiusKm: Number(serviceRadiusKm),
          vehicleType,
          bio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Account registered successfully as ${role}!`);
        if (role === "VOLUNTEER") {
          router.push("/volunteer");
        } else {
          router.push("/citizen");
        }
        router.refresh();
      } else {
        toast.error(data.error.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error("Registration error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 my-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Your ResQLink Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Select how you want to participate in the community response network
            </p>
          </div>

          {/* Role Choice Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              How do you want to use ResQLink?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("CITIZEN")}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                  role === "CITIZEN"
                    ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">I Need Help</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Request water, food, transport & shelter during emergency
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("VOLUNTEER")}
                className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                  role === "VOLUNTEER"
                    ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">I Want to Volunteer</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Provide resources & mobilize transport for neighbors
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Neighborhood / Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. SOMA, SF"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Volunteer-Specific Fields */}
            {role === "VOLUNTEER" && (
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    What emergency resources can you provide or distribute?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "WATER", label: "Water 💧" },
                      { id: "FOOD", label: "Food 🍞" },
                      { id: "TRANSPORT", label: "Transport 🚗" },
                      { id: "SHELTER", label: "Shelter 🏕️" },
                      { id: "OTHER", label: "Supplies 📦" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleCapability(c.id as ResourceType)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          capabilities.includes(c.id as ResourceType)
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Service Radius: {serviceRadiusKm} km
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={35}
                      value={serviceRadiusKm}
                      onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle / Transport</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bio & Experience</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Certifications, equipment, CERT training, availability details..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold mt-2"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
