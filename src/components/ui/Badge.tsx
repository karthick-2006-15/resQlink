import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, MapPin, Truck, Check, HelpCircle } from "lucide-react";
import { PriorityLevel, RequestStatus } from "@/types";

interface StatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  switch (status) {
    case "PENDING":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses} ${className}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Pending Verification</span>
        </span>
      );
    case "VERIFIED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Verified • Matching</span>
        </span>
      );
    case "MATCHING":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses} ${className}`}>
          <Clock className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          <span>Matching Volunteers</span>
        </span>
      );
    case "ASSIGNED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses} ${className}`}>
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Volunteer Assigned</span>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 ${sizeClasses} ${className}`}>
          <Truck className="w-3.5 h-3.5 text-purple-600" />
          <span>Delivery In Progress</span>
        </span>
      );
    case "DELIVERED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold ${sizeClasses} ${className}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivered • Awaiting Confirm</span>
        </span>
      );
    case "CONFIRMED":
    case "CLOSED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Resolved & Closed</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>Cancelled</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span>Declined</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-100 text-gray-800 ${sizeClasses} ${className}`}>
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{status}</span>
        </span>
      );
  }
}

interface PriorityBadgeProps {
  level: PriorityLevel | string;
  className?: string;
  size?: "sm" | "md";
}

export function PriorityBadge({ level, className = "", size = "md" }: PriorityBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs font-bold";

  switch (level) {
    case "CRITICAL":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 shadow-sm ${sizeClasses} ${className}`}>
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>CRITICAL</span>
        </span>
      );
    case "HIGH":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 ${sizeClasses} ${className}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          <span>HIGH</span>
        </span>
      );
    case "NORMAL":
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>NORMAL</span>
        </span>
      );
  }
}

interface ResourceBadgeProps {
  type: string;
  className?: string;
}

export function ResourceBadge({ type, className = "" }: ResourceBadgeProps) {
  const getResourceDetails = () => {
    switch (type) {
      case "WATER":
        return { label: "Water", emoji: "💧", color: "bg-sky-100 text-sky-800 border-sky-200" };
      case "FOOD":
        return { label: "Food Supplies", emoji: "🍞", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "TRANSPORT":
        return { label: "Transport", emoji: "🚗", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      case "SHELTER":
        return { label: "Emergency Shelter", emoji: "🏕️", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "OTHER":
      default:
        return { label: "Supplies", emoji: "📦", color: "bg-slate-100 text-slate-800 border-slate-200" };
    }
  };

  const details = getResourceDetails();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${details.color} ${className}`}>
      <span>{details.emoji}</span>
      <span>{details.label}</span>
    </span>
  );
}
