"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { EmergencyMap } from "@/components/map/EmergencyMap";
import {
  ShieldAlert,
  ArrowRight,
  Droplets,
  Utensils,
  Car,
  Home,
  Package,
  CheckCircle2,
  Users,
  Clock,
  Radio,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { EmergencyRequestData } from "@/types";

export default function LandingPage() {
  const [metrics, setMetrics] = useState({
    activeRequests: 27,
    availableVolunteers: 14,
    resolvedRequests: 83,
    avgResponseMinutes: 14.2,
  });
  const [sampleRequests, setSampleRequests] = useState<EmergencyRequestData[]>([]);
  const [selectedResourceTab, setSelectedResourceTab] = useState("Clean Water");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.data.kpis) {
          setMetrics(data.data.kpis);
        }
      })
      .catch(() => {});

    fetch("/api/requests?limit=15")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setSampleRequests(data.data.requests || []);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Community Emergency Resource Coordination Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                When help is nearby,{" "}
                <span className="text-blue-400">
                  make it reachable.
                </span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                ResQLink connects verified community volunteers with households in urgent need of non-medical resources based on algorithmic priority, true travel distance, and vehicle capability.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/citizen" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Request Emergency Help
                  </Button>
                </Link>

                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                    leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  >
                    Become a Volunteer
                  </Button>
                </Link>
              </div>
            </div>

            {/* LIVE CRISIS GRID MAP VISUAL */}
            <div className="mt-8 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-300">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Tactical Incident Grid • Tamil Nadu Emergency Dispatch</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px] border border-slate-700">
                  Active Dispatch Markers
                </span>
              </div>
              <EmergencyMap requests={sampleRequests} height="460px" />
            </div>
          </div>
        </section>

        {/* LIVE METRICS COUNTERS */}
        <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {metrics.activeRequests}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Active Requests
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                  {metrics.availableVolunteers}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Available Volunteers
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                  {metrics.resolvedRequests}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Requests Resolved
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {metrics.avgResponseMinutes} min
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  Avg. Response Time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Operational Protocol
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
              Structured Dispatch from Intake to Close
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Replacing ad-hoc spreadsheets with transactional integrity and audited coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Request Help",
                desc: "Citizens input verified resource requirements. An objective mathematical priority score is computed instantly.",
                icon: Clock,
              },
              {
                step: "02",
                title: "Algorithmic Match",
                desc: "Proximity engine ranks nearby verified volunteers based on Haversine distance, vehicle capacity, and workload.",
                icon: Users,
              },
              {
                step: "03",
                title: "Fulfill Delivery",
                desc: "Volunteers accept dispatches via database transactions and update telemetry as supplies are mobilized.",
                icon: Car,
              },
              {
                step: "04",
                title: "Confirm Receipt",
                desc: "Citizens confirm safe receipt of supplies to formally resolve the incident and record audit history.",
                icon: CheckCircle2,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
              >
                <span className="text-2xl font-black text-slate-200 absolute top-4 right-4">
                  {s.step}
                </span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
                  <s.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORTED RESOURCE TYPES (INTERACTIVE EXPLORER) */}
        <section className="bg-slate-100/70 border-t border-b border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Resource Taxonomy
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Coordinated Emergency Resources
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Click any category to inspect deployment specifications and active Tamil Nadu relief hubs
              </p>
            </div>

            {/* Interactive Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {[
                { title: "Clean Water", icon: Droplets, count: "Potable cans, bottles, tablets" },
                { title: "Food Supplies", icon: Utensils, count: "Ready meals, baby formula, rations" },
                { title: "Relocation Transport", icon: Car, count: "High-ground evacuation shuttles" },
                { title: "Temporary Shelter", icon: Home, count: "Heavy tarpaulins, cots, tents" },
                { title: "General Supplies", icon: Package, count: "Powerbanks, torches, hygiene kits" },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = selectedResourceTab === r.title;

                return (
                  <button
                    key={r.title}
                    type="button"
                    onClick={() => setSelectedResourceTab(r.title)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-sm"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{r.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">{r.count}</p>
                  </button>
                );
              })}
            </div>

            {/* Active Resource Details Panel */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
              {selectedResourceTab === "Clean Water" && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Potable Drinking Water Logistics</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px]">Priority 1 Resource</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Essential drinking water mobilized during municipal pipe ruptures, flood siltation, or disaster zone contamination across Tamil Nadu districts.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Standard Stock</span>
                      <span className="font-semibold text-slate-800">20L Cans & Halazone Tablets</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Active Response Hubs</span>
                      <span className="font-semibold text-slate-800">Velachery, Mylapore, Cuddalore</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Protocol SLA</span>
                      <span className="font-semibold text-emerald-700">Under 30 min critical dispatch</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedResourceTab === "Food Supplies" && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Emergency Nutrition & Infant Rations</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px]">Sustenance Support</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Nutritious ready-to-eat and dry rations delivered directly to families stranded on high floors or isolated by flooded streets.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Standard Stock</span>
                      <span className="font-semibold text-slate-800">Ready Meals & Baby Formula</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Active Response Hubs</span>
                      <span className="font-semibold text-slate-800">Anna Nagar, T. Nagar, Madurai</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Protocol SLA</span>
                      <span className="font-semibold text-emerald-700">Matched with community kitchens</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedResourceTab === "Relocation Transport" && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Non-Medical Evacuation & High-Ground Transfer</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px]">Mobility Fleet</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Coordinated ground evacuation for seniors, families, and residents requiring transfer to government relief shelters.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Vehicle Types</span>
                      <span className="font-semibold text-slate-800">4x4 SUVs, Cargo Vans, Pickups</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Active Response Hubs</span>
                      <span className="font-semibold text-slate-800">Tambaram, Porur, Coimbatore</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Protocol SLA</span>
                      <span className="font-semibold text-emerald-700">ACID reservation guarantees driver</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedResourceTab === "Temporary Shelter" && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Weatherproofing & Dry Shelter Supplies</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">Protection Kits</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Heavy-duty waterproofing tarps, sleeping blankets, and tents to protect displaced citizens whose homes have suffered storm roof damage.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Standard Stock</span>
                      <span className="font-semibold text-slate-800">20x20 Tarps, Cots, Blankets</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Active Response Hubs</span>
                      <span className="font-semibold text-slate-800">Guindy, Trichy, Srirangam</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Protocol SLA</span>
                      <span className="font-semibold text-emerald-700">Prioritized by vulnerability index</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedResourceTab === "General Supplies" && (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900">Emergency Power, Illumination & Hygiene</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px]">Hardware & Power</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Prepositioned batteries, torches, and personal hygiene supplies to maintain life safety during prolonged grid outages.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Standard Stock</span>
                      <span className="font-semibold text-slate-800">Torches, Powerbanks, Sanitation</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Active Response Hubs</span>
                      <span className="font-semibold text-slate-800">OMR Corridor, Salem, Tirunelveli</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-bold text-[10px] uppercase">Protocol SLA</span>
                      <span className="font-semibold text-emerald-700">Pre-staged volunteer inventory</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* WHY RESQLINK */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Enterprise Reliability
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 leading-tight">
                Engineered for rapid crisis coordination without operational friction.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Informal disaster groups collapse under duplicate tickets and unverifiable claims. ResQLink introduces deterministic state transitions and verified operational safety:
              </p>

              <div className="mt-6 space-y-3.5">
                {[
                  {
                    title: "Identity & Background Verification",
                    desc: "Community responders are validated by operations commanders before receiving dispatch authorization.",
                  },
                  {
                    title: "Haversine Distance Matching Algorithm",
                    desc: "Matches evaluate travel distance, vehicle capacity constraints, and current active responder workload.",
                  },
                  {
                    title: "Objective Priority Scoring Engine",
                    desc: "Urgency is mathematically calculated against population exposure and resource survival criticality.",
                  },
                  {
                    title: "Dual Confirmation Closing Protocol",
                    desc: "Deliveries must be confirmed by the citizen recipient before an incident can be marked resolved.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <span>Command Protocol Pipeline</span>
              </h3>
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-blue-400 font-bold">1. Intake Validation:</span> Zod strict validation & duplicate suppression
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-orange-400 font-bold">2. Priority Engine:</span> Urgency (40%) + Vulnerability (30%) + Resource (20%) + Aging (10%)
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-emerald-400 font-bold">3. Matching Engine:</span> Great-Circle distance radius + Workload penalty
                </div>
                <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <span className="text-indigo-400 font-bold">4. Lifecycle Isolation:</span> ACID database transactions prevent double assignment
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Community FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Emergency Coordination Answers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Everything you need to know about transactional crisis logistics and volunteer protocols.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does ResQLink verify field volunteers?",
                a: "Volunteers undergo role-based verification and admin authorization before being permitted to accept dispatches. Only verified responders receive exact delivery coordinates, protecting recipient privacy during crises.",
              },
              {
                q: "What geographic districts in Tamil Nadu are currently covered?",
                a: "The operational grid currently coordinates verified supplies across Chennai (Velachery, Anna Nagar, Mylapore, Tambaram, OMR, Guindy), Coimbatore, Madurai, Tiruchirappalli (Trichy), Cuddalore, Salem, Thoothukudi, and Tirunelveli.",
              },
              {
                q: "How is dispatch priority computed?",
                a: "ResQLink utilizes an objective 4-factor scoring algorithm weighting Urgency Level (40%), People Affected & Vulnerability (30%), Resource Criticality (20%), and Request Aging (10%) to output a deterministic priority score between 0 and 100.",
              },
              {
                q: "Does ResQLink handle emergency medical calls?",
                a: "No. ResQLink strictly coordinates non-medical emergency supplies (clean water, nutrition, high-ground evacuation, shelter, and survival hardware). For medical or fire emergencies, dial 108 or 112 immediately.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Need Help in an Emergency?</h2>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm">
              Submit your resource requirement right now. Our community response system connects you with verified nearby volunteers.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/citizen">
                <Button size="lg" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                  Request Assistance
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-6 px-4 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-white">ResQLink Emergency Systems</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-slate-500">
            Enterprise Community Emergency Resource Coordination Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
