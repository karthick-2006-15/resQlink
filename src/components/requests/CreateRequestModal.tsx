"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PriorityBadge, ResourceBadge } from "../ui/Badge";
import {
  Droplets,
  Utensils,
  Car,
  Home,
  Package,
  MapPin,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Navigation,
  Clock,
} from "lucide-react";
import { ResourceType, UrgencyLevel } from "@/types";
import { toast } from "sonner";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: () => void;
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onRequestCreated,
}: CreateRequestModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [resourceType, setResourceType] = useState<ResourceType>("WATER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("10 packets");
  const [peopleAffected, setPeopleAffected] = useState(4);
  const [urgency, setUrgency] = useState<UrgencyLevel>("HIGH");
  const [address, setAddress] = useState("742 Montgomery St, San Francisco, CA");
  const [latitude, setLatitude] = useState(37.7952);
  const [longitude, setLongitude] = useState(-122.4029);

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
  };

  const handleUseCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Acquiring current GPS coordinates...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)}`);
          toast.success("Location acquired from GPS");
        },
        () => {
          toast.error("Could not obtain GPS. Using default metro coordinates.");
        }
      );
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please enter a short title for your request");
      setStep(4);
      return;
    }
    if (!description.trim() || description.length < 10) {
      toast.error("Please provide at least 10 characters explaining your situation");
      setStep(4);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceType,
          title,
          description,
          quantity,
          peopleAffected: Number(peopleAffected),
          urgency,
          address,
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Emergency request submitted. Priority computed and dispatch active.");
        resetForm();
        onClose();
        if (onRequestCreated) onRequestCreated();
      } else {
        toast.error(data.error.message || "Failed to submit request");
      }
    } catch (err: any) {
      toast.error("Error submitting request: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceOptions = [
    { type: "WATER", label: "Clean Drinking Water", icon: Droplets, desc: "Potable bottles, bulk gallons, purification tablets" },
    { type: "FOOD", label: "Emergency Food Supplies", icon: Utensils, desc: "Ready-to-eat meals, infant formula, non-perishable rations" },
    { type: "TRANSPORT", label: "Relocation Transport", icon: Car, desc: "Non-medical evacuation, high-ground transfer for seniors" },
    { type: "SHELTER", label: "Temporary Shelter", icon: Home, desc: "Waterproof tarpaulins, thermal blankets, emergency cots" },
    { type: "OTHER", label: "General Supplies", icon: Package, desc: "Flashlights, dry clothing, hygiene packs, emergency power" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Emergency Community Resources"
      description={`Step ${step} of 6 — Quantitative intake for rapid dispatch`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* STEP 1: Select Resource */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. What resource do you urgently require?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {resourceOptions.map((res) => {
                const Icon = res.icon;
                const isSelected = resourceType === res.type;
                return (
                  <button
                    key={res.type}
                    type="button"
                    onClick={() => setResourceType(res.type as ResourceType)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-500 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{res.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{res.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Quantity & People Affected */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Specific Quantity Needed
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10 gallons, 8 meal packets, 2 tents"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Specify exact counts so responders pack correct cargo volume.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of People Affected
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Direct input into the objective priority scoring algorithm.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Urgency Level */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Select Urgency Classification
            </label>
            <div className="space-y-2.5">
              {[
                {
                  level: "CRITICAL",
                  label: "Critical (Immediate Threat)",
                  desc: "Vulnerable individuals, seniors, infants, or severe exposure without water or shelter.",
                  border: "hover:border-red-300 border-slate-200",
                  active: "border-red-500 bg-red-50/50 ring-1 ring-red-500",
                  badge: "CRITICAL",
                  icon: AlertCircle,
                  iconColor: "text-red-600",
                },
                {
                  level: "HIGH",
                  label: "High Urgency",
                  desc: "Supplies depleted within several hours. Rapid community mobilization required.",
                  border: "hover:border-orange-300 border-slate-200",
                  active: "border-orange-500 bg-orange-50/50 ring-1 ring-orange-500",
                  badge: "HIGH",
                  icon: AlertTriangle,
                  iconColor: "text-orange-600",
                },
                {
                  level: "NORMAL",
                  label: "Normal Assistance",
                  desc: "Needed within 12–24 hours for non-immediate stability.",
                  border: "hover:border-blue-300 border-slate-200",
                  active: "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500",
                  badge: "NORMAL",
                  icon: Clock,
                  iconColor: "text-blue-600",
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = urgency === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => setUrgency(opt.level as UrgencyLevel)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      isSelected ? opt.active : opt.border
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${opt.iconColor}`} />
                        <span className="font-semibold text-sm text-slate-900">{opt.label}</span>
                      </div>
                      <PriorityBadge level={opt.badge} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 pl-6">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Title & Description */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Summary Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drinking water urgently needed for 4 isolated seniors"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Situation Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current circumstances, gate codes, access limitations, or special considerations..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Minimum 10 characters.</p>
            </div>
          </div>
        )}

        {/* STEP 5: Delivery Location */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Delivery Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 742 Montgomery St, San Francisco, CA"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Geographic Telemetry</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Acquire GPS Location</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Latitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Confirmation */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Verification Summary</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-400 block">Resource:</span>
                  <ResourceBadge type={resourceType} className="mt-0.5" />
                </div>
                <div>
                  <span className="text-slate-400 block">Priority:</span>
                  <PriorityBadge level={urgency} className="mt-0.5" />
                </div>
                <div>
                  <span className="text-slate-400 block">Quantity:</span>
                  <span className="font-semibold text-slate-900">{quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">People Affected:</span>
                  <span className="font-semibold text-slate-900">{peopleAffected} individuals</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs text-slate-700">
                <span className="text-slate-400 block">Headline:</span>
                <span className="font-semibold text-slate-900">{title || "(Untitled)"}</span>
              </div>

              <div className="text-xs text-slate-700">
                <span className="text-slate-400 block">Destination:</span>
                <span className="font-medium text-slate-900">{address}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Upon submission, our matching engine immediately evaluates verified volunteers within the operational radius.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => {
                if (step === 4 && (!title.trim() || description.length < 10)) {
                  toast.error("Please fill in title and description (min 10 chars)");
                  return;
                }
                setStep(step + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleSubmit}
            >
              Submit Emergency Request
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
