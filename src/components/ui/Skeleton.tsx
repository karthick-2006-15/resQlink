"use client";

import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
      <Skeleton className="h-3 w-36 rounded-md" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded-md" />
        </td>
      ))}
    </tr>
  );
}
