"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[34px]",
      md: "px-4 py-2 text-sm gap-2 min-h-[42px]",
      lg: "px-6 py-3 text-base gap-2.5 min-h-[48px]",
    };

    const variantStyles = {
      primary:
        "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-md shadow-blue-500/10 focus-visible:ring-blue-600",
      secondary:
        "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400 border border-slate-200",
      outline:
        "bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-blue-500",
      danger:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow focus:ring-rose-500",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow focus:ring-emerald-500",
      ghost:
        "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
