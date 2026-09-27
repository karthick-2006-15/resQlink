"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PriorityBadge, ResourceBadge } from "@/components/ui/Badge";
import {
  ClipboardList,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  ArrowUpDown,
  UserCheck,
  Sparkles,
  ExternalLink,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { EmergencyRequestData, MatchCandidate, PriorityLevel } from "@/types";
import { toast } from "sonner";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [priorityModalReq, setPriorityModalReq] = useState<EmergencyRequestData | null>(null);
  const [matchModalReq, setMatchModalReq] = useState<EmergencyRequestData | null>(null);
  const [matches, setMatches] = useState<MatchCandidate[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requests/${id}/verify`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Request verified");
        fetchRequests();
      } else {
        toast.error(data.error.message);
      }
    } catch {
      toast.error("Failed to verify");
    }
  };

  const handleChangePriority = async (newPriority: PriorityLevel) => {
    if (!priorityModalReq) return;
    try {
      const res = await fetch(`/api/admin/requests/${priorityModalReq.id}/priority`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Priority updated to ${newPriority}`);
        setPriorityModalReq(null);
        fetchRequests();
      } else {
        toast.error(data.error.message);
      }
    } catch {
      toast.error("Failed to change priority");
    }
  };

  const handleOpenMatchingModal = async (req: EmergencyRequestData) => {
    setMatchModalReq(req);
    setIsLoadingMatches(true);
    try {
      const res = await fetch(`/api/admin/requests/${req.id}/matches`);
      const data = await res.json();
      if (data.success) {
        setMatches(data.data.matches || []);
      } else {
        toast.error("Matching error: " + data.error.message);
      }
    } catch {
      toast.error("Failed to run matching engine");
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleAssignVolunteer = async (volunteerId: string) => {
    if (!matchModalReq) return;
    setIsAssigning(volunteerId);
    try {
      const res = await fetch(`/api/admin/requests/${matchModalReq.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setMatchModalReq(null);
        fetchRequests();
      } else {
        toast.error(data.error.message);
      }
    } catch {
      toast.error("Assignment failed");
    } finally {
      setIsAssigning(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && r.priorityLevel !== priorityFilter) return false;
    if (resourceFilter !== "ALL" && r.resourceType !== resourceFilter) return false;
    if (
      search &&
      !r.title.toLowerCase().includes(search.toLowerCase()) &&
      !r.address.toLowerCase().includes(search.toLowerCase()) &&
      !r.id.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <span>Emergency Request Registry</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Command table of all active, in-transit, and historical emergency crisis requests
              </p>
            </div>
          </div>

          {/* Search & Multi-Filters Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 mb-6 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID, title, or street address..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CLOSED">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
              </select>

              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50"
              >
                <option value="ALL">All Resources</option>
                <option value="WATER">Water 💧</option>
                <option value="FOOD">Food 🍞</option>
                <option value="TRANSPORT">Transport 🚗</option>
                <option value="SHELTER">Shelter 🏕️</option>
                <option value="OTHER">Other 📦</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Resource & ID</th>
                    <th className="py-3.5 px-4">Title & Details</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Assigned Responder</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading requests registry...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No requests match current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <ResourceBadge type={req.resourceType} />
                            <p className="text-[10px] font-mono text-slate-400">{req.id.slice(0, 10)}...</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-900 truncate">{req.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {req.quantity} • {req.peopleAffected} people
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <PriorityBadge level={req.priorityLevel} size="sm" />
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            {req.priorityScore} pts
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate">
                          <span className="text-xs truncate block">{req.address}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          {req.currentAssignment?.volunteer ? (
                            <span className="font-semibold text-slate-900">
                              {req.currentAssignment.volunteer.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleVerify(req.id)}
                              >
                                Verify
                              </Button>
                            )}

                            {/* Match Engine Recommendation Trigger */}
                            {["PENDING", "VERIFIED", "MATCHING"].includes(req.status) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                                onClick={() => handleOpenMatchingModal(req)}
                                title="Run Matching Engine to find and assign volunteers"
                              >
                                Match
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPriorityModalReq(req)}
                            >
                              Priority
                            </Button>

                            <Link href={`/citizen/requests/${req.id}`}>
                              <Button size="sm" variant="ghost">
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filtered.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <ResourceBadge type={req.resourceType} />
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{req.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{req.quantity} • {req.address}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <PriorityBadge level={req.priorityLevel} size="sm" />
                  <div className="flex gap-1.5">
                    {req.status === "PENDING" && (
                      <Button size="sm" variant="primary" onClick={() => handleVerify(req.id)}>
                        Verify
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => handleOpenMatchingModal(req)}>
                      Match
                    </Button>
                    <Link href={`/citizen/requests/${req.id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <BottomNav role="ADMIN" />

      {/* Change Priority Modal */}
      {priorityModalReq && (
        <Modal
          isOpen={true}
          onClose={() => setPriorityModalReq(null)}
          title="Change Request Priority Level"
          description={`Override computed score for: ${priorityModalReq.title}`}
          maxWidth="sm"
        >
          <div className="space-y-3 pt-2">
            <Button
              variant="danger"
              size="md"
              className="w-full justify-between"
              onClick={() => handleChangePriority("CRITICAL")}
            >
              <span>🔴 CRITICAL (Immediate Dispatch)</span>
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full justify-between border-orange-300 text-orange-900 bg-orange-50"
              onClick={() => handleChangePriority("HIGH")}
            >
              <span>🟠 HIGH (Urgent Need)</span>
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full justify-between"
              onClick={() => handleChangePriority("NORMAL")}
            >
              <span>🟡 NORMAL (Standard Response)</span>
            </Button>
          </div>
        </Modal>
      )}

      {/* Matching Engine Recommendation Modal */}
      {matchModalReq && (
        <Modal
          isOpen={true}
          onClose={() => setMatchModalReq(null)}
          title="Matching Engine: Candidate Volunteers"
          description={`Ranked community responders for ${matchModalReq.resourceType} in ${matchModalReq.address}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            {isLoadingMatches ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-sm font-bold">Computing candidate volunteer match scores...</p>
                <p className="text-xs text-slate-400">Evaluating travel distance, radius, vehicle capacity & workload</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                <p className="font-semibold text-slate-700">No verified volunteers found in radius</p>
                <p className="text-slate-400 mt-1">
                  Ensure available volunteers have capability for &quot;{matchModalReq.resourceType}&quot; and are within travel radius.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {matches.map((cand, idx) => (
                  <div
                    key={cand.volunteer.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 transition-colors shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{cand.volunteer.user.name}</h4>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full">
                          Match Score: {cand.matchScore}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="font-bold text-blue-600">{cand.distanceKm} km away</span>
                        <span>•</span>
                        <span>⭐ {cand.volunteer.rating}</span>
                        <span>•</span>
                        <span>{cand.volunteer.completedAssignments} completed missions</span>
                        <span>•</span>
                        <span>Vehicle: {cand.volunteer.vehicleType || "Car"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                        <span>Dist: +{cand.scoreBreakdown.distanceScore}</span>
                        <span>Workload: +{cand.scoreBreakdown.workloadScore}</span>
                        <span>Resource: +{cand.scoreBreakdown.resourceMatchScore}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={isAssigning === cand.volunteer.userId}
                      onClick={() => handleAssignVolunteer(cand.volunteer.userId)}
                    >
                      Assign Responder
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
