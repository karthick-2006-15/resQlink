"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { PriorityBadge, ResourceBadge, StatusBadge } from "@/components/ui/Badge";
import { RequestTimeline } from "@/components/requests/RequestTimeline";
import { ConfirmDeliveryModal } from "@/components/requests/ConfirmDeliveryModal";
import {
  ArrowLeft,
  MapPin,
  Users,
  Clock,
  UserCheck,
  Phone,
  ShieldCheck,
  AlertCircle,
  Truck,
  CheckCircle2,
  Share2,
  Star,
  Copy,
  Check,
  Radio,
  Pencil,
  Trash2,
  Cpu,
  BarChart2,
} from "lucide-react";
import { EmergencyRequestData, AuditLogData } from "@/types";
import { toast } from "sonner";
import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EditRequestModal } from "@/components/requests/EditRequestModal";
import { PriorityRationaleModal } from "@/components/requests/PriorityRationaleModal";
import { PriorityService } from "@/lib/services/priority.service";

export default function RequestTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<EmergencyRequestData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRationaleOpen, setIsRationaleOpen] = useState(false);

  const handleDeleteRequest = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this emergency request? Any assigned volunteers will be unassigned.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request has been deleted.");
        router.push("/citizen/requests");
      } else {
        toast.error(data.error?.message || "Failed to delete request");
        setIsDeleting(false);
      }
    } catch {
      toast.error("Network error deleting request");
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Incident tracking link copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const fetchDetails = async () => {
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequest(data.data.request);
          setAuditLogs(data.data.auditLogs || []);
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
    fetchDetails();
    const interval = setInterval(fetchDetails, 6000); // Poll every 6s for live tracking transitions
    return () => clearInterval(interval);
  }, [requestId]);

  const handleCancelRequest = async () => {
    const confirmed = window.confirm("Are you sure you want to cancel this emergency request?");
    if (!confirmed) return;

    setIsCancelling(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.info("Request has been cancelled.");
        fetchDetails();
      } else {
        toast.error(data.error.message || "Failed to cancel");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsCancelling(false);
    }
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "PENDING":
        return { percent: 15, label: "Request Logged • Awaiting Admin Verification", color: "bg-amber-500" };
      case "VERIFIED":
        return { percent: 35, label: "Verified by Disaster Desk • Matching Nearby Responders", color: "bg-blue-500" };
      case "ASSIGNED":
        return { percent: 60, label: "Volunteer Responder Assigned • Preparing Supplies", color: "bg-indigo-500" };
      case "IN_PROGRESS":
        return { percent: 80, label: "Responder In Transit • Heading to Coordinates", color: "bg-blue-600" };
      case "DELIVERED":
        return { percent: 95, label: "Supplies Handed Over • Confirmation Pending", color: "bg-emerald-500" };
      case "CONFIRMED":
      case "CLOSED":
        return { percent: 100, label: "Mission Completed & Fully Verified", color: "bg-emerald-600" };
      default:
        return { percent: 20, label: "Processing Emergency Request", color: "bg-slate-500" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-5 w-40 rounded-lg" />
          </div>
          <CardSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <div>
              <CardSkeleton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Request Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">The requested emergency ID does not exist or has been archived.</p>
          <Link href="/citizen">
            <Button variant="primary" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const assignment = request.currentAssignment;
  const volunteer = assignment?.volunteer;
  const progress = getProgress(request.status);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Link & Quick Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Overview</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {request.status !== "DELIVERED" && request.status !== "CLOSED" && (
              <>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold shadow-sm transition-all"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={handleDeleteRequest}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isDeleting ? "Deleting..." : "Delete"}</span>
                </button>
              </>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Tracking</span>
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-md">ID: {request.id.slice(0, 10)}...</span>
          </div>
        </div>

        {/* Top Status Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <ResourceBadge type={request.resourceType} />
                <PriorityBadge level={request.priorityLevel} />
                <StatusBadge status={request.status} />
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full ml-auto sm:ml-0">
                  <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                  <span>Live Telemetry Active</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {request.title}
              </h1>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {request.description}
              </p>

              {/* Dynamic Live Progress Bar */}
              <div className="mt-5 space-y-1.5 max-w-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{progress.label}</span>
                  <span className="font-mono text-slate-400 font-semibold">{progress.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${progress.color} h-full transition-all duration-700 rounded-full`}
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* If Delivered -> Trigger Confirm Dialog */}
            {request.status === "DELIVERED" && (
              <div className="sm:self-center">
                <Button
                  variant="success"
                  size="lg"
                  className="font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap animate-pulse"
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Confirm Delivery Received
                </Button>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Quantity Required</span>
              <span className="font-bold text-slate-900 text-sm">{request.quantity}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">People Affected</span>
              <span className="font-bold text-slate-900 text-sm">{request.peopleAffected} individuals</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Priority Urgency</span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-slate-900 text-sm">{request.urgency} ({request.priorityScore} pts)</span>
                <button
                  type="button"
                  onClick={() => setIsRationaleOpen(true)}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline ml-auto"
                >
                  View Rationale
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block mb-0.5">Location Address</span>
              <span className="font-bold text-slate-900 text-xs truncate block">{request.address}</span>
            </div>
          </div>
        </div>

        {/* Live Timeline and Volunteer Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Timeline (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Real-Time Incident Progression</span>
            </h3>

            <RequestTimeline
              status={request.status}
              createdAt={request.createdAt}
              verifiedAt={request.verifiedAt}
              assignedAt={request.assignedAt}
              deliveredAt={request.deliveredAt}
              confirmedAt={request.confirmedAt}
              volunteerName={volunteer?.name}
            />

            {/* Cancel Action if eligible */}
            {["PENDING", "VERIFIED", "MATCHING"].includes(request.status) && (
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need to cancel this request?</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  isLoading={isCancelling}
                  onClick={handleCancelRequest}
                >
                  Cancel Request
                </Button>
              </div>
            )}
          </div>

          {/* Volunteer Responder Card (Right 1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Assigned Responder</span>
              </h3>

              {volunteer ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                      {volunteer.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{volunteer.name}</h4>
                      <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Volunteer</span>
                      </div>
                    </div>
                  </div>

                  {volunteer.phone && (
                    <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <a href={`tel:${volunteer.phone}`} className="hover:underline font-semibold">
                        {volunteer.phone}
                      </a>
                    </div>
                  )}

                  {volunteer.volunteerProfile && (
                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Rating:</span>
                        <span className="font-bold text-slate-900 inline-flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          {volunteer.volunteerProfile.rating} / 5.0
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Completed Missions:</span>
                        <span className="font-bold text-slate-900">{volunteer.volunteerProfile.completedAssignments} deliveries</span>
                      </div>
                      {volunteer.volunteerProfile.vehicleType && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vehicle:</span>
                          <span className="font-bold text-slate-900">{volunteer.volunteerProfile.vehicleType}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Matching Volunteers</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nearby verified responders have been alerted of your request priority.
                  </p>
                </div>
              )}
            </div>

            {/* Algorithmic Priority Breakdown Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Priority Intelligence</span>
                </h3>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {Math.round(request.priorityScore)}/100
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Urgency Severity ({request.urgency}):</span>
                  <span className="font-bold text-slate-900">
                    +{PriorityService.calculate({ urgency: request.urgency, peopleAffected: request.peopleAffected, resourceType: request.resourceType }).breakdown.urgencyScore} pts
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Affected Scale ({request.peopleAffected} people):</span>
                  <span className="font-bold text-slate-900">
                    +{PriorityService.calculate({ urgency: request.urgency, peopleAffected: request.peopleAffected, resourceType: request.resourceType }).breakdown.peopleScore} pts
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Resource Criticality ({request.resourceType}):</span>
                  <span className="font-bold text-slate-900">
                    +{PriorityService.calculate({ urgency: request.urgency, peopleAffected: request.peopleAffected, resourceType: request.resourceType }).breakdown.resourceScore} pts
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRationaleOpen(true)}
                className="mt-4 w-full py-2 px-3 text-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200/80 flex items-center justify-center gap-1.5"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Explain Full Scoring Model</span>
              </button>
            </div>

            {/* Audit History Box */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Audit Trail Log
              </h3>
              <div className="space-y-2 text-[11px] max-h-48 overflow-y-auto font-mono divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-400 py-1">Initial request logged.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="pt-1.5 text-slate-600">
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>{log.action}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-slate-800 font-sans mt-0.5">{log.actorName} ({log.actorRole})</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={isEditOpen}
        request={request}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchDetails}
      />

      {/* Confirmation Modal */}
      <ConfirmDeliveryModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        requestId={request.id}
        resourceType={request.resourceType}
        quantity={request.quantity}
        onSuccess={fetchDetails}
      />

      {/* Priority Rationale Modal */}
      {isRationaleOpen && (
        <PriorityRationaleModal
          isOpen={isRationaleOpen}
          onClose={() => setIsRationaleOpen(false)}
          request={request}
        />
      )}
    </div>
  );
}
