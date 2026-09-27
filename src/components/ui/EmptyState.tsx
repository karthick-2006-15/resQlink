"use client";

import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
        {icon}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 tracking-tight">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <Button
          variant="primary"
          size="sm"
          leftIcon={actionIcon}
          onClick={onAction}
          className="font-semibold shadow-sm"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
