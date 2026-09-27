"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Users,
  BarChart3,
  FileText,
  Radio,
  Truck,
  Settings,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Role } from "@/types";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return [
          { name: "Command Center", href: "/admin", icon: LayoutDashboard },
          { name: "All Requests", href: "/admin/requests", icon: ClipboardList },
          { name: "Volunteers", href: "/admin/volunteers", icon: Users },
          { name: "Live Map", href: "/admin/map", icon: MapPin },
          { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
          { name: "Audit Trail", href: "/admin/audit-logs", icon: FileText },
        ];
      case "VOLUNTEER":
        return [
          { name: "Overview", href: "/volunteer", icon: LayoutDashboard },
          { name: "Nearby Requests", href: "/volunteer/nearby", icon: Radio },
          { name: "My Assignments", href: "/volunteer/assignments", icon: Truck },
          { name: "Emergency Map", href: "/volunteer/map", icon: MapPin },
          { name: "My Profile", href: "/volunteer/profile", icon: Settings },
        ];
      case "CITIZEN":
      default:
        return [
          { name: "Dashboard", href: "/citizen", icon: LayoutDashboard },
          { name: "My Requests", href: "/citizen/requests", icon: ClipboardList },
          { name: "Emergency Map", href: "/citizen/map", icon: MapPin },
          { name: "Profile", href: "/citizen/profile", icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4">
      {/* Role Badge */}
      <div className="mb-6 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {role === "ADMIN" ? "Admin Console" : role === "VOLUNTEER" ? "Volunteer Hub" : "Citizen Portal"}
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        {links.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/volunteer" && item.href !== "/citizen" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Hotline Box */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>Life Safety Notice</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
          ResQLink coordinates non-medical resources. For medical or fire emergencies, immediately dial 108.
        </p>
      </div>
    </aside>
  );
}
