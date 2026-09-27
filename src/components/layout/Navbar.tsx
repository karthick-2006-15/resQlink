"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, LogOut, User as UserIcon, RefreshCw, Sparkles, Check, ChevronDown } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { toast } from "sonner";
import { UserSummary } from "@/types";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success) {
          setCurrentUser(data.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleSwitchDemoRole = async (email: string, targetPath: string, roleName: string) => {
    setIsSwitching(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "password123" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Switched role to: ${roleName}`);
        setShowDemoMenu(false);
        router.push(targetPath);
        router.refresh();
      } else {
        toast.error("Role switch failed: " + data.error.message);
      }
    } catch (err: any) {
      toast.error("Switch error: " + err.message);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleResetSeedData = async () => {
    const confirmed = window.confirm("Reset & re-seed database with standard hackathon demo dataset (27 active, 14 volunteers, 83 resolved)?");
    if (!confirmed) return;

    const toastId = toast.loading("Resetting and seeding demo database...");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Database restored to pristine demo state!", { id: toastId });
        router.refresh();
      } else {
        toast.error(data.error.message, { id: toastId });
      }
    } catch {
      toast.error("Failed to seed database", { id: toastId });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  ResQ<span className="text-blue-600">Link</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 rounded">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Emergency Resource Coordination
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Role Quick Switcher (Hackathon Showcase Tool) */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              disabled={isSwitching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
              title="Quickly switch between Citizen, Volunteer and Admin roles"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Demo Switcher:</span>
              <span className="font-bold underline">
                {currentUser?.role || "Switch"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Accounts
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleSwitchDemoRole("demo.citizen@example.com", "/citizen", "Citizen")
                  }
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    currentUser?.role === "CITIZEN" ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Sarah Jenkins (Citizen)</p>
                    <p className="text-[10px] text-slate-400">Request help & track status</p>
                  </div>
                  {currentUser?.role === "CITIZEN" && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  onClick={() =>
                    handleSwitchDemoRole("demo.volunteer@example.com", "/volunteer", "Volunteer")
                  }
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    currentUser?.role === "VOLUNTEER" ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Alex Rivera (Volunteer)</p>
                    <p className="text-[10px] text-slate-400">Nearby alerts & fulfill delivery</p>
                  </div>
                  {currentUser?.role === "VOLUNTEER" && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <button
                  onClick={() =>
                    handleSwitchDemoRole("demo.admin@example.com", "/admin", "Admin")
                  }
                  className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    currentUser?.role === "ADMIN" ? "font-bold text-blue-600 bg-blue-50/50" : "text-slate-700"
                  }`}
                >
                  <div>
                    <p className="font-semibold">Marcus Vance (Ops Lead)</p>
                    <p className="text-[10px] text-slate-400">Command center & matching</p>
                  </div>
                  {currentUser?.role === "ADMIN" && <Check className="w-4 h-4 text-blue-600" />}
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={handleResetSeedData}
                    className="w-full text-left px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset & Seed Demo Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          {currentUser && <NotificationDropdown />}

          {/* User Profile / Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href={
                  currentUser.role === "CITIZEN"
                    ? "/citizen"
                    : currentUser.role === "VOLUNTEER"
                    ? "/volunteer"
                    : "/admin"
                }
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-xs font-semibold text-slate-700"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span>{currentUser.name.split(" ")[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
