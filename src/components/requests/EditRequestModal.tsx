"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PriorityBadge } from "../ui/Badge";
import {
  Droplets,
  Utensils,
  Car,
  Home,
  Package,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Minus,
  Plus,
  Navigation,
  ExternalLink,
  Search,
} from "lucide-react";
import { EmergencyRequestData, ResourceType, UrgencyLevel } from "@/types";
import { toast } from "sonner";

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequestData | null;
  onSuccess?: () => void;
}

export function EditRequestModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: EditRequestModalProps) {
  const [resourceType, setResourceType] = useState<ResourceType>("WATER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [peopleAffected, setPeopleAffected] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>("NORMAL");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [googleMapsInput, setGoogleMapsInput] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (request) {
      setResourceType(request.resourceType);
      setTitle(request.title || "");
      setDescription(request.description || "");
      setQuantity(request.quantity || "");
      setPeopleAffected(request.peopleAffected || 1);
      setUrgency((request.urgency as UrgencyLevel) || "NORMAL");
      setAddress(request.address || "");
      setLatitude(request.latitude || 13.0827);
      setLongitude(request.longitude || 80.2707);
    }
  }, [request]);

  if (!request) return null;

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Acquiring GPS coordinates...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(6)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(6)));
          toast.success("GPS coordinates updated.");
        },
        () => {
          toast.error("Could not obtain GPS. Keeping current coordinates.");
        }
      );
    }
  };

  const handleOpenGoogleMaps = () => {
    const query = address ? encodeURIComponent(address) : `${latitude},${longitude}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.info("Google Maps opened in a new tab", {
      description: "Find your location, right-click to copy coordinates (or copy URL), then paste below to auto-fill.",
      duration: 8000,
    });
  };

  const handleParseGoogleMapsLocation = async (inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) return;

    let parsedLat: number | null = null;
    let parsedLng: number | null = null;

    // 1. Direct coordinates: 13.0827, 80.2707
    const coordMatch = trimmed.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    if (coordMatch) {
      parsedLat = parseFloat(coordMatch[1]);
      parsedLng = parseFloat(coordMatch[2]);
    } else {
      // 2. URL with @lat,lng
      const atMatch = trimmed.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
      if (atMatch) {
        parsedLat = parseFloat(atMatch[1]);
        parsedLng = parseFloat(atMatch[2]);
      } else {
        // 3. Query q=lat,lng
        const qMatch = trimmed.match(/[?&]q=(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
        if (qMatch) {
          parsedLat = parseFloat(qMatch[1]);
          parsedLng = parseFloat(qMatch[2]);
        }
      }
    }

    if (parsedLat !== null && parsedLng !== null) {
      setLatitude(parseFloat(parsedLat.toFixed(5)));
      setLongitude(parseFloat(parsedLng.toFixed(5)));
      setIsGeocoding(true);
      toast.success("Google Maps Coordinates Extracted", {
        description: `Latitude: ${parsedLat.toFixed(4)}, Longitude: ${parsedLng.toFixed(4)}. Updating location pin...`,
      });

      // Try reverse geocoding via OpenStreetMap Nominatim for human address
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${parsedLat}&lon=${parsedLng}`,
          { headers: { "Accept-Language": "en" } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.display_name) {
            setAddress(geoData.display_name);
          }
        }
      } catch {
        // Keep existing address if offline
      } finally {
        setIsGeocoding(false);
      }
    } else {
      toast.error("Could not extract coordinates", {
        description: "Please paste a Google Maps link or coordinates formatted as: 13.0827, 80.2707",
      });
    }
  };

  const handleSelectPreset = (preset: { address: string; lat: number; lng: number }) => {
    setAddress(preset.address);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    toast.success(`Location set to ${preset.address.split(",")[0]}`);
  };

  const TN_LOCATION_PRESETS = [
    { label: "Velachery (Chennai)", address: "14 Velachery Main Rd, Velachery, Chennai", lat: 12.9791, lng: 80.2206 },
    { label: "Anna Nagar (Chennai)", address: "42 2nd Ave, Anna Nagar, Chennai", lat: 13.0850, lng: 80.2101 },
    { label: "Porur (Chennai)", address: "Mount Poonamallee Rd, Porur, Chennai", lat: 13.0382, lng: 80.1565 },
    { label: "OMR (Chennai)", address: "OMR IT Corridor, Sholinganallur, Chennai", lat: 12.9010, lng: 80.2279 },
    { label: "Coimbatore", address: "Cross Cut Rd, Gandhipuram, Coimbatore", lat: 11.0168, lng: 76.9558 },
    { label: "Madurai", address: "Goripalayam Junction, Madurai", lat: 9.9252, lng: 78.1198 },
    { label: "Trichy", address: "Amma Mandapam Rd, Srirangam, Trichy", lat: 10.8622, lng: 78.6948 },
    { label: "Salem", address: "Junction Main Rd, Suramangalam, Salem", lat: 11.6643, lng: 78.1460 },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }
    if (!description.trim() || description.length < 10) {
      toast.error("Description must be at least 10 characters explaining your emergency context");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EDIT",
          title,
          description,
          quantity,
          peopleAffected: Number(peopleAffected),
          urgency,
          resourceType,
          address,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request updated successfully!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const errorMsg = data.error?.message || "Failed to update request";
        toast.error("Unable to Update Request", {
          description: errorMsg,
          duration: 7000,
        });
      }
    } catch (err: any) {
      toast.error("Network Error", {
        description: err.message || "Failed to communicate with emergency response server",
        duration: 7000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceOptions = [
    { type: "WATER", label: "Clean Water", icon: Droplets },
    { type: "FOOD", label: "Food Supplies", icon: Utensils },
    { type: "TRANSPORT", label: "Transport", icon: Car },
    { type: "SHELTER", label: "Temporary Shelter", icon: Home },
    { type: "OTHER", label: "General Supplies", icon: Package },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Emergency Request"
      description="Update resource parameters, affected counts, and delivery details"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Resource Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Resource Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {resourceOptions.map((res) => {
              const Icon = res.icon;
              const isSelected = resourceType === res.type;
              return (
                <button
                  key={res.type}
                  type="button"
                  onClick={() => setResourceType(res.type as ResourceType)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                  <span>{res.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Request Headline / Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Clean drinking water cans needed for family of 4"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Situation Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details about your current situation and access conditions..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Quantity & People Affected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity Needed
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 10 gallons, 4 food packs"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              People Affected
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPeopleAffected(Math.max(1, peopleAffected - 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max="100"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center px-2 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setPeopleAffected(Math.min(100, peopleAffected + 1))}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500">people</span>
            </div>
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Urgency Rating
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { level: "NORMAL", label: "Normal", desc: "Supplies within 24h", color: "border-slate-300" },
              { level: "HIGH", label: "High", desc: "Needed within 4h", color: "border-amber-400" },
              { level: "CRITICAL", label: "Critical", desc: "Immediate life hazard", color: "border-rose-500" },
            ].map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setUrgency(opt.level as UrgencyLevel)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  urgency === opt.level
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="font-bold text-xs block">{opt.label}</span>
                <span className={`text-[10px] block mt-0.5 ${urgency === opt.level ? "text-slate-300" : "text-slate-400"}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Address & Google Maps Selector */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Street / Neighborhood Address
              </label>
              {isGeocoding && (
                <span className="text-[11px] text-blue-600 font-semibold animate-pulse">
                  Resolving address...
                </span>
              )}
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Velachery Main Rd, Chennai, Tamil Nadu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Tamil Nadu Hotspots */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block mb-1">
              Tamil Nadu Hotspot Presets:
            </span>
            <div className="flex flex-wrap gap-1">
              {TN_LOCATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Google Maps Actions Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span>Google Maps Telemetry</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Pick on Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3 h-3 text-blue-600" />
                  <span>GPS</span>
                </button>
              </div>
            </div>

            {/* Paste Google Maps Link or Coords */}
            <div className="flex gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={googleMapsInput}
                  onChange={(e) => setGoogleMapsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleParseGoogleMapsLocation(googleMapsInput);
                    }
                  }}
                  placeholder="Paste Google Maps URL or coordinates (13.0827, 80.2707)"
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleParseGoogleMapsLocation(googleMapsInput)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Latitude and Longitude */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-mono text-xs"
                />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="font-bold shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
