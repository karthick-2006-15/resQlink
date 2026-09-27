"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { EmergencyMap } from "@/components/map/EmergencyMap";
import {
  ShieldAlert,
  ArrowRight,
  Droplet,
  Utensils,
  Car,
  Home,
  Package,
  CheckCircle2,
  Users,
  Clock,
  Radio,
  Sparkles,
  ShieldCheck,
  ChevronRight,
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

  useEffect(() => {
    // Fetch live overview metrics and sample requests
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Next-Gen Community Disaster Logistics</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
                When help is nearby,{" "}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                  make it reachable.
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
                ResQLink connects urgent non-medical community emergency resource requests with verified, location-aware volunteers based on algorithmic priority and real-time proximity.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/citizen" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-full sm:w-auto font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Request Emergency Help
                  </Button>
                </Link>

                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700"
                    leftIcon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  >
                    Become a Verified Volunteer
                  </Button>
                </Link>
              </div>

              {/* Hackathon Demo Quick Access Callout */}
              <div className="mt-8 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 text-xs text-slate-300 max-w-xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white">Hackathon Judges:</span> Instant demo logins active in top bar or button:
                  </div>
                </div>
                <Link href="/login" className="font-bold text-blue-400 hover:text-blue-300 underline whitespace-nowrap">
                  Demo Credentials &rarr;
                </Link>
              </div>
            </div>

            {/* LIVE EMERGENCY MAP VISUAL */}
            <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950">
              <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-200">
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Live Operational Crisis Grid • San Francisco Metro Dispatch</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px]">
                  Real-time GPS Markers
                </span>
              </div>
              <EmergencyMap requests={sampleRequests} height="480px" />
            </div>
          </div>
        </section>

        {/* LIVE METRICS COUNTERS */}
        <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
                  {metrics.activeRequests}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
                  Active Requests
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
                  {metrics.availableVolunteers}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
                  Available Volunteers
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                  {metrics.resolvedRequests}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
                  Requests Resolved
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {metrics.avgResponseMinutes} min
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
                  Avg. Response Time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
              Protocol Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Four Steps From Crisis to Resolution
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Engineered for extreme reliability, transparency, and rapid community mobilization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Request Help",
                desc: "Citizens submit urgent resource needs (water, food, transport, shelter). System automatically calculates an objective priority score.",
                icon: Clock,
              },
              {
                step: "02",
                title: "Get Matched",
                desc: "Matching algorithm scores candidate volunteers by real geographic distance, vehicle capability, and active workload.",
                icon: Users,
              },
              {
                step: "03",
                title: "Receive Support",
                desc: "Verified volunteer accepts the dispatch, starts transit, and delivers supplies with real-time status progression.",
                icon: Car,
              },
              {
                step: "04",
                title: "Confirm Resolution",
                desc: "Citizen confirms receipt of supplies to close the incident, update community impact metrics, and preserve audit trails.",
                icon: CheckCircle2,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-3xl font-black text-slate-200 absolute top-4 right-5">
                  {s.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SUPPORTED RESOURCE TYPES */}
        <section className="bg-slate-100/70 border-t border-b border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-slate-900">
                Non-Medical Emergency Resources
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Connecting community stockpiles and volunteer capacities with households in need
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { title: "Clean Water", emoji: "💧", count: "Gallons, filtration, purification packs" },
                { title: "Food Supplies", emoji: "🍞", count: "Ready meals, baby formula, dry rations" },
                { title: "Transport", emoji: "🚗", count: "Evacuation, high-ground shuttles, 4x4 access" },
                { title: "Temporary Shelter", emoji: "🏕️", count: "Tarps, tents, cots, thermal blankets" },
                { title: "Other Supplies", emoji: "📦", count: "Flashlights, batteries, hygiene kits" },
              ].map((r) => (
                <div key={r.title} className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <div className="text-3xl mb-2">{r.emoji}</div>
                  <h4 className="font-bold text-sm text-slate-900">{r.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-1">{r.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY RESQLINK */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Startup Grade Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2 leading-tight">
                Built to outperform ad-hoc spreadsheets and chaotic chat groups.
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                During crisis events, informal coordination groups crumble under duplicate requests, out-of-order deliveries, and zero accountability. ResQLink implements institutional-grade dispatch protocols:
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Strict Identity & Background Verification",
                    desc: "Volunteers must be validated by operational admins before they can accept emergency assignments.",
                  },
                  {
                    title: "Location-Aware Haversine Matching Engine",
                    desc: "Volunteers are matched based on true travel distance, service radius limits, and specific vehicle capacities.",
                  },
                  {
                    title: "Objective Priority Scoring Algorithm",
                    desc: "Urgency is mathematically weighted against vulnerable populations and critical resource requirements.",
                  },
                  {
                    title: "Immutable Audit Trails & Dual Confirmation",
                    desc: "Deliveries must be confirmed by the citizen recipient before an incident can be resolved.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-blue-400" />
                <span>Command Center Architecture</span>
              </h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-blue-400">1. Ingestion:</span> Zod schema validation & duplicate prevention
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-amber-400">2. Priority Engine:</span> Urgency (40%) + Vulnerability (30%) + Resource (20%) + Aging (10%)
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-emerald-400">3. Matching Engine:</span> Distance radius + Workload penalty + Capabilities filter
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                  <span className="text-indigo-400">4. Lifecycle State Machine:</span> Database transactional isolation guards against race conditions
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold">Need Help in an Emergency?</h2>
            <p className="mt-3 text-slate-200 text-sm">
              Submit your resource requirement right now. Our community response system connects you with verified nearby volunteers within minutes.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/citizen">
                <Button size="lg" variant="primary" className="bg-white text-blue-900 hover:bg-slate-100 font-bold shadow-lg">
                  Request Assistance Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-white">ResQLink Emergency Systems</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Designed for Hackathon Demonstration • Community Emergency Resource Coordination Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
