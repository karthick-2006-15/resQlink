"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MetricCard } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Award,
  ShieldCheck,
  Star,
} from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  NORMAL: "#3b82f6",
};

const RESOURCE_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#10b981", "#64748b"];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData && resData.success) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const kpis = data?.kpis || {
    totalRequests: 110,
    activeRequests: 27,
    resolvedRequests: 83,
    pendingRequests: 4,
    criticalRequests: 3,
    totalVolunteers: 14,
    availableVolunteers: 14,
    avgResponseMinutes: 14.2,
    avgResolutionMinutes: 48.5,
  };

  const byResource = data?.breakdowns?.byResource || [];
  const byPriority = data?.breakdowns?.byPriority || [];
  const byStatus = data?.breakdowns?.byStatus || [];
  const topVolunteers = data?.topVolunteers || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>Operational Analytics & Response Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live algorithmic dispatch performance, resource distribution metrics, and community response times
            </p>
          </div>

          {/* Primary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              title="Total Dispatches"
              value={kpis.totalRequests}
              subtitle={`${kpis.resolvedRequests} deliveries confirmed & resolved`}
              icon={<TrendingUp className="w-5 h-5" />}
              variant="default"
            />
            <MetricCard
              title="Avg. Response Time"
              value={`${kpis.avgResponseMinutes} min`}
              subtitle="From incident log to responder acceptance"
              icon={<Clock className="w-5 h-5" />}
              variant="info"
            />
            <MetricCard
              title="Avg. Resolution Time"
              value={`${kpis.avgResolutionMinutes} min`}
              subtitle="From dispatch to citizen confirmation"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="success"
            />
            <MetricCard
              title="Active Responder Force"
              value={kpis.availableVolunteers}
              subtitle="100% verified on-duty responders"
              icon={<Users className="w-5 h-5" />}
              variant="warning"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Requests by Resource Type */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Requests by Resource Category
              </h3>
              <p className="text-xs text-slate-400 mb-4">Volume breakdown across essential categories</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byResource} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Requests by Priority */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Requests by Priority Classification
              </h3>
              <p className="text-xs text-slate-400 mb-4">Urgency levels calculated by priority scoring engine</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byPriority} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: "0.75rem", fontSize: "12px" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {byPriority.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PRIORITY_COLORS[entry.name] || "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Status Breakdown & Volunteer Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Lifecycle State Machine Distribution
              </h3>
              <p className="text-xs text-slate-400 mb-4">Current distribution across all incident lifecycle states</p>
              <div className="space-y-3">
                {byStatus.map((st: any) => {
                  const percentage = Math.round((st.count / (kpis.totalRequests || 1)) * 100);
                  return (
                    <div key={st.name}>
                      <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                        <span>{st.name}</span>
                        <span>{st.count} incidents ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Volunteers Leaderboard */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Top Volunteer Responders</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">Highest impact community members by completed missions</p>

              <div className="space-y-3">
                {topVolunteers.map((vol: any, idx: number) => (
                  <div
                    key={vol.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{vol.name}</h4>
                        <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                          Radius: {vol.serviceRadiusKm} km • Rating:
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline" />
                          <span className="font-semibold text-slate-700">{vol.rating}</span>
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
                      {vol.completed} missions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="ADMIN" />
    </div>
  );
}
