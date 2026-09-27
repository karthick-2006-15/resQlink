import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Check,
  HelpCircle,
  Droplets,
  Utensils,
  Car,
  Home,
  Package,
} from "lucide-react";
import { PriorityLevel, RequestStatus } from "@/types";

interface StatusBadgeProps {
  status: RequestStatus | string;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className = "", size = "md" }: StatusBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  switch (status) {
    case "PENDING":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending Verification</span>
        </span>
      );
    case "VERIFIED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          <CheckCircle2 className="w-3 h-3 text-sky-600" />
          <span>Verified</span>
        </span>
      );
    case "MATCHING":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <Clock className="w-3 h-3 text-indigo-600 animate-spin" />
          <span>Matching Volunteers</span>
        </span>
      );
    case "ASSIGNED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <MapPin className="w-3 h-3 text-blue-600" />
          <span>Volunteer Assigned</span>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <Truck className="w-3 h-3 text-purple-600" />
          <span>In Progress</span>
        </span>
      );
    case "DELIVERED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    case "CONFIRMED":
    case "CLOSED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <Check className="w-3 h-3 text-slate-600" />
          <span>Resolved</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3 h-3 text-rose-500" />
          <span>Cancelled</span>
        </span>
      );
    case "REJECTED":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-red-50 text-red-700 border border-red-200 ${sizeClasses} ${className}`}>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span>Declined</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}>
          <HelpCircle className="w-3 h-3" />
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
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs font-semibold";

  switch (level) {
    case "CRITICAL":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-red-50 text-red-800 border border-red-200 shadow-sm ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span className="tracking-wide uppercase">Critical</span>
        </span>
      );
    case "HIGH":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          <span className="tracking-wide uppercase">High</span>
        </span>
      );
    case "NORMAL":
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span className="tracking-wide uppercase">Normal</span>
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
        return { label: "Water", icon: Droplets, color: "bg-sky-50 text-sky-700 border-sky-200" };
      case "FOOD":
        return { label: "Food", icon: Utensils, color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "TRANSPORT":
        return { label: "Transport", icon: Car, color: "bg-indigo-50 text-indigo-700 border-indigo-200" };
      case "SHELTER":
        return { label: "Shelter", icon: Home, color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "OTHER":
      default:
        return { label: "Supplies", icon: Package, color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const details = getResourceDetails();
  const Icon = details.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${details.color} ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{details.label}</span>
    </span>
  );
}
