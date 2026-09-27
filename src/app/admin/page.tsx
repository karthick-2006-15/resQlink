"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmergencyMap } from "@/components/map/EmergencyMap";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/Card";
import { StatusBadge, PriorityBadge, ResourceBadge } from "@/components/ui/Badge";
import {
  ShieldAlert,
  AlertCircle,
  Radio,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from "lucide-react";
import { EmergencyRequestData } from "@/types";
import { toast } from "sonner";

export default function AdminCommandCenter() {
  const [metrics, setMetrics] = useState({
    activeRequests: 27,
    criticalRequests: 3,
    availableVolunteers: 14,
    resolvedRequests: 83,
    pendingRequests: 4,
    avgResponseMinutes: 14.2,
  });
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchCommandData = async () => {
    try {
      const [analyticsRes, reqsRes] = await Promise.all([
        fetch("/api/analytics/overview"),
        fetch("/api/requests?limit=50"),
      ]);

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        if (aData.success && aData.data.kpis) {
          setMetrics(aData.data.kpis);
        }
      }

      if (reqsRes.ok) {
        const rData = await reqsRes.json();
        if (rData.success) {
          setRequests(rData.data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandData();
    const interval = setInterval(fetchCommandData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyRequest = async (requestId: string) => {
    setVerifyingId(requestId);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/verify`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request verified! Dispatched to matching engine.");
        fetchCommandData();
      } else {
        toast.error(data.error.message || "Failed to verify request");
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const criticalRequests = requests.filter(
    (r) => r.priorityLevel === "CRITICAL" && !["CLOSED", "CANCELLED"].includes(r.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Command Center Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>Live Operational Dispatch • Status Green</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Emergency Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time situational awareness, rapid volunteer dispatch & resource tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/admin/requests">
                <Button variant="outline" size="sm">
                  Manage All Requests
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Full Analytics
                </Button>
              </Link>
            </div>
          </div>

          {/* Operational KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
            <MetricCard
              title="Active Requests"
              value={metrics.activeRequests}
              subtitle="Active crisis incidents on grid"
              icon={<Activity className="w-5 h-5" />}
              variant="default"
            />
            <MetricCard
              title="Critical Priority"
              value={metrics.criticalRequests}
              subtitle="Immediate action required"
              icon={<AlertCircle className="w-5 h-5 animate-pulse" />}
              variant="critical"
            />
            <MetricCard
              title="Available Responders"
              value={metrics.availableVolunteers}
              subtitle="Verified & active on radar"
              icon={<Users className="w-5 h-5" />}
              variant="info"
            />
            <MetricCard
              title="Resolved Incidents"
              value={metrics.resolvedRequests}
              subtitle="Confirmed deliveries closed"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="success"
            />
            <MetricCard
              title="Avg. Response"
              value={`${metrics.avgResponseMinutes}m`}
              subtitle="Triage to assignment speed"
              icon={<Clock className="w-5 h-5" />}
              variant="warning"
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>

          {/* Interactive Live Crisis Map */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-600 animate-pulse" />
                <span>Live Tactical Grid Map</span>
              </h2>
              <Link href="/admin/map" className="text-xs font-bold text-blue-600 hover:underline">
                Open Fullscreen Map &rarr;
              </Link>
            </div>

            <EmergencyMap requests={requests} height="480px" />
          </div>

          {/* Pending Verification & Critical Dispatch Action Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Requests Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Incoming Requests Awaiting Admin Verification</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-full">
                    {pendingRequests.length}
                  </span>
                </h3>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">All Requests Verified</p>
                  <p className="text-slate-400 mt-0.5">No pending requests in the review queue.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ResourceBadge type={req.resourceType} />
                          <PriorityBadge level={req.priorityLevel} size="sm" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate">{req.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.quantity} • {req.peopleAffected} people • {req.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={verifyingId === req.id}
                          leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                          onClick={() => handleVerifyRequest(req.id)}
                        >
                          Verify
                        </Button>
                        <Link href={`/citizen/requests/${req.id}`}>
                          <Button variant="outline" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Critical Emergencies List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
                  <span>High & Critical Priority Emergencies</span>
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-900 rounded-full">
                    {criticalRequests.length}
                  </span>
                </h3>
              </div>

              {criticalRequests.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No Critical Emergencies</p>
                  <p className="text-slate-400 mt-0.5">Community threats are currently stabilized.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {criticalRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ResourceBadge type={req.resourceType} />
                          <StatusBadge status={req.status} size="sm" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 truncate">{req.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {req.quantity} • {req.peopleAffected} people • {req.address}
                        </p>
                      </div>

                      <Link href={`/citizen/requests/${req.id}`} className="flex-shrink-0">
                        <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Dispatch
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="ADMIN" />
    </div>
  );
}
