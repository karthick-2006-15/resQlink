"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PriorityBadge, ResourceBadge } from "@/components/ui/Badge";
import {
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ExternalLink,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { AssignmentData } from "@/types";
import { toast } from "sonner";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function VolunteerAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [tab, setTab] = useState<"ACTIVE" | "HISTORY">("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/volunteers/assignments");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAssignments(data.data.assignments || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (
    assignmentId: string,
    status: "IN_PROGRESS" | "DELIVERED"
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/volunteers/assignments/${assignmentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchAssignments();
      } else {
        toast.error(data.error.message || "Failed to update status");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsUpdating(false);
    }
  };

  const activeAssignments = assignments.filter((a) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(a.status)
  );
  const pastAssignments = assignments.filter((a) =>
    ["DELIVERED", "CONFIRMED", "CANCELLED"].includes(a.status)
  );

  const displayedList = tab === "ACTIVE" ? activeAssignments : pastAssignments;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                <span>My Delivery Missions</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage assigned dispatches, update delivery transit, and mark completion
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTab("ACTIVE")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  tab === "ACTIVE"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active ({activeAssignments.length})
              </button>
              <button
                onClick={() => setTab("HISTORY")}
                className={`px-4 py-1.5 rounded-lg transition-all ${
                  tab === "HISTORY"
                    ? "bg-white text-slate-900 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                History ({pastAssignments.length})
              </button>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : displayedList.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-6 h-6" />}
              title={tab === "ACTIVE" ? "No active delivery missions" : "No past delivery history"}
              description={
                tab === "ACTIVE"
                  ? "Check nearby requests to accept new emergency dispatches in your operating radius."
                  : "Completed missions will appear here once verified and confirmed by recipients."
              }
              actionText={tab === "ACTIVE" ? "Browse Nearby Requests" : undefined}
              onAction={tab === "ACTIVE" ? () => (window.location.href = "/volunteer/nearby") : undefined}
            />
          ) : (
            <div className="space-y-4">
              {displayedList.map((assignment) => {
                const req = assignment.request;
                if (!req) return null;

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <ResourceBadge type={req.resourceType} />
                          <PriorityBadge level={req.priorityLevel} />
                          <StatusBadge status={assignment.status} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          {req.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          Supplies needed: <strong className="text-slate-900">{req.quantity}</strong> for <strong>{req.peopleAffected} people</strong>
                        </p>
                      </div>

                      <div className="text-right sm:self-center">
                        <Link
                          href={`/citizen/requests/${req.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <span>Full Incident Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Requester & Address Details */}
                    <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50/80 p-4 rounded-2xl my-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 block text-[11px]">Dropoff Destination:</span>
                          <span className="font-bold text-slate-900">{req.address}</span>
                        </div>
                      </div>

                      {req.requester && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-400 block text-[11px]">Citizen Contact:</span>
                            <span className="font-bold text-slate-900">
                              {req.requester.name} {req.requester.phone ? `(${req.requester.phone})` : ""}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational Action Controls */}
                    {tab === "ACTIVE" && (
                      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Accepted {new Date(assignment.acceptedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {assignment.status === "ASSIGNED" && (
                            <Button
                              variant="primary"
                              size="md"
                              className="w-full sm:w-auto font-bold"
                              isLoading={isUpdating}
                              leftIcon={<Truck className="w-4 h-4" />}
                              onClick={() => handleUpdateStatus(assignment.id, "IN_PROGRESS")}
                            >
                              Start Delivery Transit
                            </Button>
                          )}

                          {assignment.status === "IN_PROGRESS" && (
                            <Button
                              variant="success"
                              size="md"
                              className="w-full sm:w-auto font-bold"
                              isLoading={isUpdating}
                              leftIcon={<CheckCircle2 className="w-4 h-4" />}
                              onClick={() => handleUpdateStatus(assignment.id, "DELIVERED")}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNav role="VOLUNTEER" />
    </div>
  );
}
