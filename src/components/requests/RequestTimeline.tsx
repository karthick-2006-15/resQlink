"use client";

import React from "react";
import { Check, Clock, Truck, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { RequestStatus } from "@/types";

interface RequestTimelineProps {
  status: RequestStatus;
  createdAt: string;
  verifiedAt?: string | null;
  assignedAt?: string | null;
  deliveredAt?: string | null;
  confirmedAt?: string | null;
  volunteerName?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: any;
  timestamp?: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
}

export function RequestTimeline({
  status,
  createdAt,
  verifiedAt,
  assignedAt,
  deliveredAt,
  confirmedAt,
  volunteerName,
}: RequestTimelineProps) {
  // Determine step completion states based on request lifecycle
  const steps: Step[] = [
    {
      id: "SUBMITTED",
      title: "Request Submitted",
      description: "Priority calculated by system",
      icon: Clock,
      timestamp: createdAt,
      isCompleted: true,
      isCurrent: status === "PENDING",
    },
    {
      id: "VERIFIED",
      title: "Request Verified",
      description: "Validated by emergency ops",
      icon: ShieldCheck,
      timestamp: verifiedAt,
      isCompleted: ["VERIFIED", "MATCHING", "ASSIGNED", "IN_PROGRESS", "DELIVERED", "CONFIRMED", "CLOSED"].includes(status),
      isCurrent: status === "VERIFIED" || status === "MATCHING",
    },
    {
      id: "ASSIGNED",
      title: "Volunteer Assigned",
      description: volunteerName ? `${volunteerName} accepted assignment` : "Matching available volunteers",
      icon: MapPin,
      timestamp: assignedAt,
      isCompleted: ["ASSIGNED", "IN_PROGRESS", "DELIVERED", "CONFIRMED", "CLOSED"].includes(status),
      isCurrent: status === "ASSIGNED",
    },
    {
      id: "IN_PROGRESS",
      title: "Delivery In Progress",
      description: "Volunteer is en route with supplies",
      icon: Truck,
      timestamp: null,
      isCompleted: ["IN_PROGRESS", "DELIVERED", "CONFIRMED", "CLOSED"].includes(status),
      isCurrent: status === "IN_PROGRESS",
    },
    {
      id: "DELIVERED",
      title: "Marked Delivered",
      description: "Awaiting citizen confirmation",
      icon: CheckCircle2,
      timestamp: deliveredAt,
      isCompleted: ["DELIVERED", "CONFIRMED", "CLOSED"].includes(status),
      isCurrent: status === "DELIVERED",
    },
    {
      id: "CONFIRMED",
      title: "Received & Resolved",
      description: "Citizen confirmed receipt. Incident closed.",
      icon: Check,
      timestamp: confirmedAt,
      isCompleted: ["CONFIRMED", "CLOSED"].includes(status),
      isCurrent: status === "CONFIRMED" || status === "CLOSED",
    },
  ];

  return (
    <div className="py-4">
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative group">
              {/* Icon Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  step.isCurrent
                    ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse"
                    : step.isCompleted
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400 border border-slate-300"
                }`}
              >
                {step.isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Step details */}
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <h4
                    className={`text-sm font-bold ${
                      step.isCurrent
                        ? "text-blue-600"
                        : step.isCompleted
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                </div>

                {step.timestamp && (
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(step.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
