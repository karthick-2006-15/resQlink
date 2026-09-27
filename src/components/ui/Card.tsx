"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm ${
        hover ? "transition-all duration-200 hover:shadow-md hover:border-slate-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 border-b border-slate-100 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={`text-base sm:text-lg font-bold text-slate-900 tracking-tight ${className}`}>{children}</h3>;
}

export function CardDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-4 sm:p-5 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl ${className}`}>{children}</div>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "critical" | "warning" | "success" | "info";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp,
  variant = "default",
  className = "",
}: MetricCardProps) {
  const variantStyles = {
    default: {
      border: "border-slate-200/90",
      iconBg: "bg-blue-50 text-blue-700",
      accent: "",
    },
    critical: {
      border: "border-rose-200 bg-rose-50/20",
      iconBg: "bg-rose-100 text-rose-700",
      accent: "text-rose-700",
    },
    warning: {
      border: "border-amber-200 bg-amber-50/20",
      iconBg: "bg-amber-100 text-amber-700",
      accent: "text-amber-700",
    },
    success: {
      border: "border-emerald-200 bg-emerald-50/20",
      iconBg: "bg-emerald-100 text-emerald-700",
      accent: "text-emerald-700",
    },
    info: {
      border: "border-sky-200 bg-sky-50/20",
      iconBg: "bg-sky-100 text-sky-700",
      accent: "text-sky-700",
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-md ${style.border} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-bold ${
              trendUp ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1.5 font-medium leading-snug">
          {subtitle}
        </p>
      )}
    </div>
  );
}
