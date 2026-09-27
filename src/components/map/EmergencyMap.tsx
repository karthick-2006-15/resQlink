"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PriorityBadge, ResourceBadge, StatusBadge } from "../ui/Badge";
import { EmergencyRequestData, ResourceType } from "@/types";
import { Filter, Layers, Navigation, AlertCircle } from "lucide-react";
import Link from "next/link";

// Dynamically import Leaflet components to avoid SSR 'window is not defined'
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface EmergencyMapProps {
  requests: EmergencyRequestData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showFilters?: boolean;
  onSelectRequest?: (req: EmergencyRequestData) => void;
}

export function EmergencyMap({
  requests,
  center = [37.7749, -122.4194],
  zoom = 13,
  height = "550px",
  showFilters = true,
  onSelectRequest,
}: EmergencyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  useEffect(() => {
    setIsClient(true);
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (selectedResource !== "ALL" && r.resourceType !== selectedResource) return false;
    if (selectedPriority !== "ALL" && r.priorityLevel !== selectedPriority) return false;
    return true;
  });

  // Custom marker icon generator
  const createCustomIcon = (req: EmergencyRequestData) => {
    if (!L) return undefined;

    let bgColor = "#2563eb";
    let pulseClass = "";

    if (req.priorityLevel === "CRITICAL" && req.status !== "CLOSED") {
      bgColor = "#dc2626";
      pulseClass = "animate-ping opacity-75";
    } else if (req.priorityLevel === "HIGH" && req.status !== "CLOSED") {
      bgColor = "#ea580c";
    } else if (req.status === "DELIVERED") {
      bgColor = "#10b981";
    } else if (req.status === "CLOSED") {
      bgColor = "#64748b";
    }

    const emojiMap: Record<string, string> = {
      WATER: "💧",
      FOOD: "🍞",
      TRANSPORT: "🚗",
      SHELTER: "🏕️",
      OTHER: "📦",
    };

    const emoji = emojiMap[req.resourceType] || "📍";

    const html = `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${
          req.priorityLevel === "CRITICAL" && req.status !== "CLOSED"
            ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: #ef4444; opacity: 0.6;" class="animate-ping"></div>`
            : ""
        }
        <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 2;">
          ${emoji}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-map-icon",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  };

  if (!isClient || !L) {
    return (
      <div
        style={{ height }}
        className="w-full bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 animate-pulse"
      >
        <Navigation className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-semibold text-slate-600">Loading Live Emergency Map...</p>
        <p className="text-xs text-slate-400 mt-0.5">Plotting active crisis markers and coordinates</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
      {/* Floating Filter Controls */}
      {showFilters && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-[400] flex flex-wrap gap-2 bg-white/95 backdrop-blur p-2 rounded-xl shadow-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 text-slate-600 font-semibold border-r border-slate-200">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Resources</option>
            <option value="WATER">Water 💧</option>
            <option value="FOOD">Food 🍞</option>
            <option value="TRANSPORT">Transport 🚗</option>
            <option value="SHELTER">Shelter 🏕️</option>
            <option value="OTHER">Other 📦</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🔴 Critical Only</option>
            <option value="HIGH">🟠 High Priority</option>
            <option value="NORMAL">🟡 Normal</option>
          </select>

          <div className="flex items-center px-2 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-md ml-auto">
            {filteredRequests.length} plotted
          </div>
        </div>
      )}

      {/* Map Container */}
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredRequests.map((req) => (
            <Marker
              key={req.id}
              position={[req.latitude, req.longitude]}
              icon={createCustomIcon(req)}
              eventHandlers={{
                click: () => onSelectRequest && onSelectRequest(req),
              }}
            >
              <Popup className="resqlink-popup">
                <div className="p-1 min-w-[220px] max-w-[280px]">
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <ResourceBadge type={req.resourceType} />
                    <PriorityBadge level={req.priorityLevel} size="sm" />
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                    {req.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {req.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Quantity:</span>
                      <span className="font-semibold text-slate-800">{req.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Affected:</span>
                      <span className="font-semibold text-slate-800">{req.peopleAffected} people</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/citizen/requests/${req.id}`}
                      className="block w-full py-1.5 px-3 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                      View Live Tracking
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap font-medium">
          <span className="font-bold text-slate-800">Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-4" />
            <span>Critical Emergency</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Priority</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Normal / Assigned</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Delivered</span>
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Click any pin for request details and dispatch actions
        </div>
      </div>
    </div>
  );
}
