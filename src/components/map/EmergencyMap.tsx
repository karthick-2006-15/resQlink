"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PriorityBadge, ResourceBadge, StatusBadge } from "../ui/Badge";
import { EmergencyRequestData, ResourceType } from "@/types";
import { Filter, Navigation, Droplets, Utensils, Car, Home, Package, ExternalLink } from "lucide-react";
import Link from "next/link";

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

  const filteredRequests = requests.filter((r) => {
    if (selectedResource !== "ALL" && r.resourceType !== selectedResource) return false;
    if (selectedPriority !== "ALL" && r.priorityLevel !== selectedPriority) return false;
    return true;
  });

  // Pure SVG icon markers (zero emojis)
  const getResourceSvgPath = (type: string) => {
    switch (type) {
      case "WATER":
        return `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "FOOD":
        return `<path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2M6 2v10a3 3 0 0 0 6 0V2M15 11v11M9 12v10" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "TRANSPORT":
        return `<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="17" r="2" fill="none" stroke="white" stroke-width="2"/><circle cx="17" cy="17" r="2" fill="none" stroke="white" stroke-width="2"/>`;
      case "SHELTER":
        return `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
      case "OTHER":
      default:
        return `<path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  };

  const createCustomIcon = (req: EmergencyRequestData) => {
    if (!L) return undefined;

    let pinColor = "#2563eb";
    let isCritical = false;

    if (req.priorityLevel === "CRITICAL" && req.status !== "CLOSED") {
      pinColor = "#dc2626";
      isCritical = true;
    } else if (req.priorityLevel === "HIGH" && req.status !== "CLOSED") {
      pinColor = "#ea580c";
    } else if (req.status === "DELIVERED") {
      pinColor = "#059669";
    } else if (req.status === "CLOSED") {
      pinColor = "#475569";
    }

    const svgIconPath = getResourceSvgPath(req.resourceType);

    const html = `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${
          isCritical
            ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: rgba(220, 38, 38, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ""
        }
        <div style="background-color: ${pinColor}; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.35); transform: rotate(-45deg);">
          <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg width="15" height="15" viewBox="0 0 24 24">
              ${svgIconPath}
            </svg>
          </div>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: "custom-map-marker",
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    });
  };

  if (!isClient || !L) {
    return (
      <div
        style={{ height }}
        className="w-full bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200"
      >
        <Navigation className="w-6 h-6 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-600">Initializing Tactical Crisis Grid...</p>
        <p className="text-[11px] text-slate-400 mt-0.5">Plotting active verified resource coordinates</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
      {/* Floating Filter Controls */}
      {showFilters && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-[400] flex flex-wrap gap-2 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold pr-2 border-r border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter Grid:</span>
          </div>

          {/* Resource Filter */}
          <select
            value={selectedResource}
            onChange={(e) => setSelectedResource(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Resources</option>
            <option value="WATER">Water</option>
            <option value="FOOD">Food</option>
            <option value="TRANSPORT">Transport</option>
            <option value="SHELTER">Shelter</option>
            <option value="OTHER">Supplies</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Priority</option>
            <option value="NORMAL">Normal</option>
          </select>

          <div className="flex items-center px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 rounded ml-auto">
            {filteredRequests.length} Active Pins
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

                  <h4 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-2">
                    {req.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {req.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
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
                      <span className="font-semibold text-slate-800">{req.peopleAffected} individuals</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/citizen/requests/${req.id}`}
                      className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      <span>Track Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
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
          <span className="font-semibold text-slate-800">Operational Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-600" />
            <span>Critical</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-500" />
            <span>High</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-600" />
            <span>Normal / Dispatched</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
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
