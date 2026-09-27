"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestCard } from "@/components/requests/RequestCard";
import { CreateRequestModal } from "@/components/requests/CreateRequestModal";
import { EditRequestModal } from "@/components/requests/EditRequestModal";
import { ConfirmDeliveryModal } from "@/components/requests/ConfirmDeliveryModal";
import { Plus, Clock, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Inbox } from "lucide-react";
import { EmergencyRequestData, UserSummary } from "@/types";
import { toast } from "sonner";
import Link from "next/link";

export default function CitizenDashboard() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Delivery confirmation modal state
  const [confirmModalData, setConfirmModalData] = useState<{
    id: string;
    resource: string;
    quantity: string;
  } | null>(null);
  const [editingRequest, setEditingRequest] = useState<EmergencyRequestData | null>(null);

  const handleDeleteRequest = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this emergency request?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request deleted.");
        fetchCitizenData();
      } else {
        toast.error(data.error?.message || "Failed to delete request");
      }
    } catch {
      toast.error("Network error deleting request");
    }
  };

  const fetchCitizenData = async () => {
    try {
      const [userRes, reqsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/requests?myRequests=true"),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.success) setUser(uData.data.user);
      }

      if (reqsRes.ok) {
        const rData = await reqsRes.json();
        if (rData.success) setRequests(rData.data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenData();
    const interval = setInterval(fetchCitizenData, 8000); // 8s polling for live updates
    return () => clearInterval(interval);
  }, []);

  const activeRequests = requests.filter(
    (r) => !["CLOSED", "CANCELLED", "REJECTED"].includes(r.status)
  );
  const resolvedRequests = requests.filter((r) => ["CONFIRMED", "CLOSED"].includes(r.status));
  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="CITIZEN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {getGreeting()}, {user?.name || "Neighbor"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Here&apos;s the live operational status of your emergency community requests.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="font-semibold shadow-sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Request Emergency Help
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <MetricCard
              title="Active Incidents"
              value={activeRequests.length}
              subtitle="Requiring responder dispatch or in-flight transit"
              icon={<AlertTriangle className="w-5 h-5" />}
              variant="critical"
            />
            <MetricCard
              title="Resolved Requests"
              value={resolvedRequests.length}
              subtitle="Supplies confirmed and closed successfully"
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="success"
            />
            <MetricCard
              title="Pending Review"
              value={pendingRequests.length}
              subtitle="Queued for admin operations validation"
              icon={<Clock className="w-5 h-5" />}
              variant="warning"
            />
          </div>

          {/* Delivered Alert Banner (Action Needed from Citizen!) */}
          {activeRequests.some((r) => r.status === "DELIVERED") && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400/80 shadow-md animate-beacon flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Supplies Marked as Delivered!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    A volunteer has delivered your resources. Please confirm receipt to close the request.
                  </p>
                </div>
              </div>
              <Button
                variant="success"
                size="sm"
                className="font-bold whitespace-nowrap shadow-sm"
                onClick={() => {
                  const delReq = activeRequests.find((r) => r.status === "DELIVERED");
                  if (delReq) {
                    setConfirmModalData({
                      id: delReq.id,
                      resource: delReq.resourceType,
                      quantity: delReq.quantity,
                    });
                  }
                }}
              >
                Confirm Supplies Received
              </Button>
            </div>
          )}

          {/* Active Emergency Requests */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Active Emergency Requests</span>
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                  {activeRequests.length}
                </span>
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : activeRequests.length === 0 ? (
              <EmptyState
                icon={<Inbox className="w-6 h-6" />}
                title="No active emergency requests"
                description="You have no pending requests in the system. When you or someone near you needs emergency water, food, shelter, or transport, click below."
                actionText="Create Emergency Request"
                actionIcon={<Plus className="w-4 h-4" />}
                onAction={() => setIsCreateOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    role="CITIZEN"
                    onEdit={(r) => setEditingRequest(r)}
                    onDelete={handleDeleteRequest}
                    onConfirmDelivery={() =>
                      setConfirmModalData({
                        id: req.id,
                        resource: req.resourceType,
                        quantity: req.quantity,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past Request History */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Completed & Past History
            </h2>

            {resolvedRequests.length === 0 ? (
              <div className="p-6 bg-slate-100/60 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No past resolved requests recorded under your profile.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedRequests.map((req) => (
                  <RequestCard key={req.id} request={req} role="CITIZEN" />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav role="CITIZEN" />

      {/* Request Wizard Modal */}
      <CreateRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRequestCreated={fetchCitizenData}
      />

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={!!editingRequest}
        request={editingRequest}
        onClose={() => setEditingRequest(null)}
        onSuccess={fetchCitizenData}
      />

      {/* Confirmation Modal */}
      {confirmModalData && (
        <ConfirmDeliveryModal
          isOpen={true}
          onClose={() => setConfirmModalData(null)}
          requestId={confirmModalData.id}
          resourceType={confirmModalData.resource}
          quantity={confirmModalData.quantity}
          onSuccess={fetchCitizenData}
        />
      )}
    </div>
  );
}
