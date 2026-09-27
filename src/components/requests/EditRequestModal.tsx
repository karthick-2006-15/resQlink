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
        toast.error(data.error?.message || "Failed to update request");
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message);
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

        {/* Delivery Address */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Street / Neighborhood Address
            </label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Navigation className="w-3 h-3" />
              <span>Use Current GPS</span>
            </button>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 14 Velachery Main Rd, Chennai, Tamil Nadu"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
