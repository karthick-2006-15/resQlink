"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PriorityBadge, ResourceBadge, StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Users, MapPin, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { EmergencyRequestData } from "@/types";

interface RequestCardProps {
  request: EmergencyRequestData;
  role?: "CITIZEN" | "VOLUNTEER" | "ADMIN";
  onAccept?: (id: string) => void;
  onVerify?: (id: string) => void;
  onConfirmDelivery?: (id: string) => void;
  isAccepting?: boolean;
}

export function RequestCard({
  request,
  role = "CITIZEN",
  onAccept,
  onVerify,
  onConfirmDelivery,
  isAccepting = false,
}: RequestCardProps) {
  const isCritical = request.priorityLevel === "CRITICAL" && request.status !== "CLOSED";

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md ${
        isCritical
          ? "border-rose-300 ring-1 ring-rose-200/60 bg-rose-50/20"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Top Header: Resource & Status Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <ResourceBadge type={request.resourceType} />
          <PriorityBadge level={request.priorityLevel} />
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Title & Quantity */}
      <div className="mb-2.5">
        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {request.title}
        </h4>
        <p className="text-xs text-slate-600 font-medium mt-0.5">
          Requirement: <span className="font-bold text-slate-800">{request.quantity}</span>
        </p>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {request.description}
      </p>

      {/* Meta Indicators */}
      <div className="grid grid-cols-2 gap-2 py-3 border-t border-b border-slate-100 mb-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{request.address}</span>
        </div>

        <div className="flex items-center gap-1.5 justify-end">
          <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-800">{request.peopleAffected}</strong> people
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
          </span>
        </div>

        {request.distanceKm !== undefined && (
          <div className="flex items-center gap-1.5 justify-end text-blue-600 font-bold">
            <span>{request.distanceKm} km away</span>
          </div>
        )}
      </div>

      {/* Card Action Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Volunteer Accept Action */}
        {role === "VOLUNTEER" && (
          <>
            {request.status === "VERIFIED" || request.status === "PENDING" || request.status === "MATCHING" ? (
              <Button
                size="sm"
                variant={isCritical ? "danger" : "primary"}
                className="w-full"
                isLoading={isAccepting}
                onClick={() => onAccept && onAccept(request.id)}
              >
                Accept Emergency Request
              </Button>
            ) : (
              <Link href="/volunteer/assignments" className="w-full">
                <Button size="sm" variant="outline" className="w-full">
                  View in My Assignments
                </Button>
              </Link>
            )}
          </>
        )}

        {/* Citizen Delivery Confirmation Action */}
        {role === "CITIZEN" && (
          <div className="flex items-center justify-between w-full gap-2">
            {request.status === "DELIVERED" ? (
              <Button
                size="sm"
                variant="success"
                className="flex-1"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => onConfirmDelivery && onConfirmDelivery(request.id)}
              >
                Confirm Supplies Received
              </Button>
            ) : null}

            <Link href={`/citizen/requests/${request.id}`} className="flex-1">
              <Button size="sm" variant="secondary" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Live Tracking
              </Button>
            </Link>
          </div>
        )}

        {/* Admin Actions */}
        {role === "ADMIN" && (
          <div className="flex items-center justify-between w-full gap-2">
            {request.status === "PENDING" && onVerify && (
              <Button
                size="sm"
                variant="primary"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                onClick={() => onVerify(request.id)}
              >
                Verify
              </Button>
            )}
            <Link href={`/citizen/requests/${request.id}`} className="ml-auto">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3 h-3" />}>
                Details
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
