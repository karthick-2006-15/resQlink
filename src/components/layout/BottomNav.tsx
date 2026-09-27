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
  Radio,
  Truck,
  Settings,
} from "lucide-react";
import { Role } from "@/types";

interface BottomNavProps {
  role: Role;
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();

  const getLinks = () => {
    switch (role) {
      case "ADMIN":
        return [
          { name: "Overview", href: "/admin", icon: LayoutDashboard },
          { name: "Requests", href: "/admin/requests", icon: ClipboardList },
          { name: "Volunteers", href: "/admin/volunteers", icon: Users },
          { name: "Map", href: "/admin/map", icon: MapPin },
          { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        ];
      case "VOLUNTEER":
        return [
          { name: "Home", href: "/volunteer", icon: LayoutDashboard },
          { name: "Nearby", href: "/volunteer/nearby", icon: Radio },
          { name: "Deliveries", href: "/volunteer/assignments", icon: Truck },
          { name: "Map", href: "/volunteer/map", icon: MapPin },
          { name: "Profile", href: "/volunteer/profile", icon: Settings },
        ];
      case "CITIZEN":
      default:
        return [
          { name: "Home", href: "/citizen", icon: LayoutDashboard },
          { name: "Requests", href: "/citizen/requests", icon: ClipboardList },
          { name: "Map", href: "/citizen/map", icon: MapPin },
          { name: "Profile", href: "/citizen/profile", icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] text-center transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
