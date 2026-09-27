"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/Card";
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
  Phone,
  Award,
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
        toast.success(`Responder status set to: ${nextVal ? "Available for Dispatch" : "Off Duty"}`);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Top Status & Availability Header */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    Volunteer Station: {user?.name || "Responder"}
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  Location: <span className="font-semibold text-slate-700">{profile?.address || "San Francisco Metro"}</span> • Operational Radius: <span className="font-semibold text-slate-700">{profile?.serviceRadiusKm || 10} km</span>
                </p>
              </div>

              {/* Availability Toggle Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAvailability}
                  disabled={isTogglingAvailability}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg font-semibold text-xs transition-all border ${
                    profile?.isAvailable
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      profile?.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                    }`}
                  />
                  <span>{profile?.isAvailable ? "Status: Available for Dispatch" : "Status: Off Duty"}</span>
                  <Power className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Verification Banner */}
            {!profile?.isVerified && (
              <div className="mt-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Verification Pending:</strong> Operations command must approve your credentials before you can accept dispatches.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Nearby Needs"
              value={nearbyCount}
              subtitle="Inside your verified operating radius"
              icon={<Radio className="w-5 h-5" />}
              variant="info"
            />
            <MetricCard
              title="Active Missions"
              value={activeAssignments.length}
              subtitle="Deliveries currently under transit"
              icon={<Truck className="w-5 h-5" />}
              variant="default"
            />
            <MetricCard
              title="Completed Missions"
              value={profile?.completedAssignments || 0}
              subtitle="Verified deliveries confirmed by citizens"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="success"
            />
            <MetricCard
              title="Responder Rating"
              value={`${profile?.rating || 5.0} / 5.0`}
              subtitle="Citizen satisfaction score"
              icon={<Award className="w-5 h-5" />}
              variant="warning"
            />
          </div>

          {/* ACTIVE ASSIGNMENT ACTION CARD */}
          {activeAssignments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Current Active Delivery Mission</span>
              </h2>

              <div className="space-y-4">
                {activeAssignments.map((assignment) => {
                  const req = assignment.request;
                  if (!req) return null;

                  return (
                    <div
                      key={assignment.id}
                      className="bg-white rounded-2xl border border-blue-300 shadow-sm p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          <ResourceBadge type={req.resourceType} />
                          <PriorityBadge level={req.priorityLevel} />
                          <StatusBadge status={assignment.status} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Mission ID: {assignment.id.slice(0, 10)}
                        </span>
                      </div>

                      <div className="py-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {req.title}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Supplies required: <strong className="text-slate-900">{req.quantity}</strong> for <strong>{req.peopleAffected} individuals</strong>
                        </p>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>Destination: <strong>{req.address}</strong></span>
                          </div>
                          {req.requester?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>Citizen Contact: <strong>{req.requester.phone}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Link href={`/citizen/requests/${req.id}`} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full">
                            Open Tracking
                          </Button>
                        </Link>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {assignment.status === "ASSIGNED" && (
                            <Button
                              variant="primary"
                              size="md"
                              className="w-full sm:w-auto font-semibold"
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
                              className="w-full sm:w-auto font-semibold"
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
          <div className="bg-slate-900 rounded-2xl text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-semibold mb-2">
                <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Radius Proximity Feed</span>
              </div>
              <h3 className="text-xl font-bold">
                {nearbyCount} Urgent Emergency Requests Near You
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Review verified community requests filtered by your vehicle capabilities and travel radius.
              </p>
            </div>

            <Link href="/volunteer/nearby">
              <Button
                variant="primary"
                size="md"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap"
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
