"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { RequestCard } from "@/components/requests/RequestCard";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Radio, Filter, RefreshCw, AlertTriangle, Inbox, Search } from "lucide-react";
import { EmergencyRequestData, VolunteerProfileData } from "@/types";
import { toast } from "sonner";

export default function VolunteerNearbyPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [profile, setProfile] = useState<VolunteerProfileData | null>(null);
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "CRITICAL_HIGH">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchNearby = async () => {
    try {
      const res = await fetch("/api/volunteers/nearby");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.data.requests || []);
          setProfile(data.data.profile);
        } else {
          toast.error(data.error.message);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
    const interval = setInterval(fetchNearby, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    if (!profile?.isVerified) {
      toast.error("Your volunteer account is pending admin verification before accepting emergency requests.");
      return;
    }

    if (!profile?.isAvailable) {
      toast.error("You are currently set to Unavailable. Toggle status to Available first.");
      return;
    }

    setAcceptingId(requestId);
    try {
      const res = await fetch(`/api/volunteers/assignments/${requestId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request accepted. You are assigned to coordinate delivery.");
        router.push("/volunteer/assignments");
      } else {
        toast.error(data.error.message || "Failed to accept request");
      }
    } catch (err: any) {
      toast.error("Accept error: " + err.message);
    } finally {
      setAcceptingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (resourceFilter !== "ALL" && r.resourceType !== resourceFilter) return false;
    if (priorityFilter === "CRITICAL_HIGH" && r.priorityLevel !== "CRITICAL" && r.priorityLevel !== "HIGH") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchAddr = r.address.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex w-full min-w-0">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
                <span>Nearby Emergency Requests</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized requests within your {profile?.serviceRadiusKm || 10} km operational radius
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
                onClick={() => {
                  setIsLoading(true);
                  fetchNearby();
                }}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Verification Status Warning if unverified */}
          {!profile?.isVerified && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <strong>Volunteer Verification Required:</strong> Your application is currently awaiting admin approval. You can view nearby requests, but must be verified before accepting dispatches.
              </div>
            </div>
          )}

          {/* Enhanced Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by locality (e.g. Velachery, Madurai), resource, or incident..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70"
                />
              </div>

              {/* Priority Toggle */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPriorityFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    priorityFilter === "ALL"
                      ? "bg-white text-slate-900 shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Priority
                </button>
                <button
                  type="button"
                  onClick={() => setPriorityFilter("CRITICAL_HIGH")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    priorityFilter === "CRITICAL_HIGH"
                      ? "bg-rose-600 text-white shadow-sm font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Critical Only
                </button>
              </div>
            </div>

            {/* Resource Filter Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: "All Types" },
                  { id: "WATER", label: "Water" },
                  { id: "FOOD", label: "Food" },
                  { id: "TRANSPORT", label: "Transport" },
                  { id: "SHELTER", label: "Shelter" },
                  { id: "OTHER", label: "Supplies" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setResourceFilter(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      resourceFilter === item.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-bold text-slate-500">
                {filtered.length} matching {filtered.length === 1 ? "request" : "requests"}
              </span>
            </div>
          </div>

          {/* Requests Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-6 h-6" />}
              title="No requests currently nearby"
              description="All community requests in your immediate vicinity are currently assigned or resolved. Check back or expand your radius in profile settings."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filtered.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  role="VOLUNTEER"
                  onAccept={handleAcceptRequest}
                  isAccepting={acceptingId === req.id}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomNav role="VOLUNTEER" />
    </div>
  );
}
