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
import { Radio, Filter, RefreshCw, AlertTriangle, Inbox } from "lucide-react";
import { EmergencyRequestData, VolunteerProfileData } from "@/types";
import { toast } from "sonner";

export default function VolunteerNearbyPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [profile, setProfile] = useState<VolunteerProfileData | null>(null);
  const [resourceFilter, setResourceFilter] = useState("ALL");
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
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="VOLUNTEER" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
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
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
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

          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 mb-6 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Filter by Resource:</span>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 font-medium text-slate-700"
              >
                <option value="ALL">All Capabilities</option>
                <option value="WATER">Water</option>
                <option value="FOOD">Food</option>
                <option value="TRANSPORT">Transport</option>
                <option value="SHELTER">Shelter</option>
                <option value="OTHER">Supplies</option>
              </select>
            </div>

            <span className="font-semibold text-slate-700">
              {filtered.length} dispatch opportunities
            </span>
          </div>

          {/* Requests Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
