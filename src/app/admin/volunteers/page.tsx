"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResourceBadge } from "@/components/ui/Badge";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Truck,
  Clock,
  Sparkles,
  Inbox,
  AlertTriangle,
} from "lucide-react";
import { VolunteerProfileData } from "@/types";
import { toast } from "sonner";

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerProfileData[]>([]);
  const [filter, setFilter] = useState<"pending" | "verified" | "all">("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchVolunteers = async () => {
    try {
      const res = await fetch(`/api/admin/volunteers?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVolunteers(data.data.volunteers || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchVolunteers();
  }, [filter]);

  const handleVerifyOrReject = async (id: string, action: "VERIFY" | "REJECT") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchVolunteers();
      } else {
        toast.error(data.error.message);
      }
    } catch {
      toast.error("Operation failed");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingList = volunteers.filter((v) => !v.isVerified);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Volunteer Responder Verification Center</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Review and verify community volunteers to authorize emergency response dispatches
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  filter === "pending"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending Verification
              </button>
              <button
                onClick={() => setFilter("verified")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  filter === "verified"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Verified Active Responders
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Volunteers
              </button>
            </div>
          </div>

          {/* Volunteers List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : volunteers.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-6 h-6" />}
              title={filter === "pending" ? "No pending volunteer applicants" : "No volunteers found"}
              description={filter === "pending" ? "All registered community volunteers have been processed and verified." : "No responder records match the selected filter."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {volunteers.map((v) => {
                const caps = Array.isArray(v.capabilities) ? v.capabilities : [];

                return (
                  <div
                    key={v.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                            {v.user?.name.charAt(0) || "V"}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{v.user?.name}</h3>
                            <p className="text-xs text-slate-500">{v.user?.email}</p>
                          </div>
                        </div>

                        {v.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Review</span>
                          </span>
                        )}
                      </div>

                      {/* Info Metadata */}
                      <div className="space-y-2 py-3 border-t border-b border-slate-100 text-xs text-slate-600 my-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Location: <strong>{v.address || "Tamil Nadu"}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Vehicle: <strong>{v.vehicleType || "SUV / Car"}</strong> • Radius: <strong>{v.serviceRadiusKm} km</strong></span>
                        </div>
                        {v.bio && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl mt-1">
                            &quot;{v.bio}&quot;
                          </p>
                        )}
                      </div>

                      {/* Capabilities Badges */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Resource Distribution Capabilities:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {caps.map((c) => (
                            <ResourceBadge key={c} type={c} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Verification Actions */}
                    {!v.isVerified && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1 font-bold"
                          isLoading={processingId === v.id}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleVerifyOrReject(v.id, "VERIFY")}
                        >
                          Verify & Grant Dispatch Access
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                          onClick={() => handleVerifyOrReject(v.id, "REJECT")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNav role="ADMIN" />
    </div>
  );
}
