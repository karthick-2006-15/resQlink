"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge, ResourceBadge } from "@/components/ui/Badge";
import {
  ShieldCheck,
  Radio,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Power,
  MapPin,
  Clock,
  Sparkles,
  Phone,
} from "lucide-react";
import { AssignmentData, VolunteerProfileData, UserSummary } from "@/types";
import { toast } from "sonner";

export default function VolunteerDashboard() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [profile, setProfile] = useState<VolunteerProfileData | null>(null);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchVolunteerData = async () => {
    try {
      const [meRes, assignRes, nearbyRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/volunteers/assignments"),
        fetch("/api/volunteers/nearby"),
      ]);

      if (meRes.ok) {
        const mData = await meRes.json();
        if (mData.success) {
          setUser(mData.data.user);
          setProfile(mData.data.user.volunteerProfile);
        }
      }

      if (assignRes.ok) {
        const aData = await assignRes.json();
        if (aData.success) {
          setAssignments(aData.data.assignments || []);
        }
      }

      if (nearbyRes.ok) {
        const nData = await nearbyRes.json();
        if (nData.success) {
          setNearbyCount(nData.data.requests?.length || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
    const interval = setInterval(fetchVolunteerData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setIsTogglingAvailability(true);
    const nextVal = !profile.isAvailable;

    try {
      const res = await fetch("/api/volunteers/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, isAvailable: nextVal } : null));
        toast.success(`Responder status set to: ${nextVal ? "Available 🟢" : "Unavailable ⚪"}`);
      } else {
        toast.error(data.error.message);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, nextStatus: "IN_PROGRESS" | "DELIVERED") => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/volunteers/assignments/${assignmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchVolunteerData();
      } else {
        toast.error(data.error.message || "Status update failed");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const activeAssignments = assignments.filter((a) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(a.status)
  );
  const completedAssignments = assignments.filter((a) =>
    ["DELIVERED", "CONFIRMED"].includes(a.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Top Status & Availability Header */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Volunteer Station: {user?.name || "Responder"}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Location: <span className="font-semibold text-slate-700">{profile?.address || "San Francisco Metro"}</span> • Service Radius: <span className="font-semibold text-slate-700">{profile?.serviceRadiusKm || 10} km</span>
                </p>
              </div>

              {/* Availability Toggle Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAvailability}
                  disabled={isTogglingAvailability}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-sm ${
                    profile?.isAvailable
                      ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-400 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      profile?.isAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                    }`}
                  />
                  <span>{profile?.isAvailable ? "Status: Available for Dispatch" : "Status: Off Duty"}</span>
                  <Power className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Verification Banner */}
            {!profile?.isVerified && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Verification Pending:</strong> Operations command must approve your credentials before you can accept dispatches. (Admins can verify you in the Admin Console).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                <Radio className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Nearby Needs
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{nearbyCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-purple-600 mb-1">
                <Truck className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Active Missions
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{activeAssignments.length}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Missions Completed
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {profile?.completedAssignments || 0}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Rating
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {profile?.rating || 5.0} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </p>
            </div>
          </div>

          {/* ACTIVE ASSIGNMENT ACTION CARD */}
          {activeAssignments.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Current Active Delivery Mission</span>
              </h2>

              <div className="space-y-4">
                {activeAssignments.map((assignment) => {
                  const req = assignment.request;
                  if (!req) return null;

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-3xl border-2 border-blue-500 shadow-lg p-6 sm:p-8"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ResourceBadge type={req.resourceType} />
                          <PriorityBadge level={req.priorityLevel} />
                          <StatusBadge status={assignment.status} />
                        </div>
                        <span className="text-xs font-mono text-slate-400">
                          Mission ID: {assignment.id}
                        </span>
                      </div>

                      <div className="py-4">
                        <h3 className="text-xl font-bold text-slate-900 leading-snug">
                          {req.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          Supplies required: <strong className="text-slate-900">{req.quantity}</strong> for <strong>{req.peopleAffected} people</strong>
                        </p>

                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>Destination: <strong>{req.address}</strong></span>
                          </div>
                          {req.requester?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span>Citizen Phone: <strong>{req.requester.phone}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons: Start Delivery or Mark Delivered */}
                      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Link href={`/citizen/requests/${req.id}`} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full">
                            Open Navigation & Tracking
                          </Button>
                        </Link>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {assignment.status === "ASSIGNED" && (
                            <Button
                              variant="primary"
                              size="md"
                              className="w-full sm:w-auto font-bold"
                              isLoading={isUpdatingStatus}
                              leftIcon={<Truck className="w-4 h-4" />}
                              onClick={() => handleStatusUpdate(assignment.id, "IN_PROGRESS")}
                            >
                              Start Delivery Transit
                            </Button>
                          )}

                          {assignment.status === "IN_PROGRESS" && (
                            <Button
                              variant="success"
                              size="md"
                              className="w-full sm:w-auto font-bold"
                              isLoading={isUpdatingStatus}
                              leftIcon={<CheckCircle2 className="w-4 h-4" />}
                              onClick={() => handleStatusUpdate(assignment.id, "DELIVERED")}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Link to Nearby Requests */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold mb-3">
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span>Live Radius Dispatch</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {nearbyCount} Urgent Emergency Requests Near You
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Review verified community requests filtered by your vehicle capabilities and travel radius.
              </p>
            </div>

            <Link href="/volunteer/nearby">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-blue-900 hover:bg-slate-100 font-bold shadow-lg whitespace-nowrap"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Nearby Feed
              </Button>
            </Link>
          </div>
        </main>
      </div>

      <BottomNav role="VOLUNTEER" />
    </div>
  );
}
