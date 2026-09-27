"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PriorityBadge, ResourceBadge } from "../ui/Badge";
import {
  Droplet,
  Utensils,
  Car,
  Home,
  Package,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Navigation,
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
        toast.success("Emergency request submitted! Priority computed & dispatch active.");
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
    { type: "WATER", label: "Clean Drinking Water", icon: Droplet, desc: "Potable bottles, gallons, purification packs", emoji: "💧" },
    { type: "FOOD", label: "Emergency Food & Meals", icon: Utensils, desc: "Non-perishable rations, baby formula, ready meals", emoji: "🍞" },
    { type: "TRANSPORT", label: "Emergency Transport", icon: Car, desc: "Non-medical evacuation, relocation for seniors", emoji: "🚗" },
    { type: "SHELTER", label: "Temporary Shelter", icon: Home, desc: "Tarpaulins, emergency blankets, tents, dry cots", emoji: "🏕️" },
    { type: "OTHER", label: "Other Vital Supplies", icon: Package, desc: "Warm clothes, flashlights, power banks", emoji: "📦" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Emergency Community Resources"
      description={`Step ${step} of 6 — Fill in urgent requirements for rapid verification`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* STEP 1: Select Resource */}
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">
              1. What resource do you urgently require?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {resourceOptions.map((res) => (
                <button
                  key={res.type}
                  type="button"
                  onClick={() => setResourceType(res.type as ResourceType)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    resourceType === res.type
                      ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <span className="text-2xl">{res.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{res.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{res.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Quantity & People Affected */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Specific Quantity Needed
              </label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10 gallons, 8 meal packets, 2 tents"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Be specific to help volunteers pack the exact supplies.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Number of People Affected
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Higher counts increase the computed priority score.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Urgency Level */}
        {step === 3 && (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-800">
              Select Urgency Level
            </label>
            <div className="space-y-2.5">
              {[
                {
                  level: "CRITICAL",
                  label: "Critical (Immediate Threat)",
                  desc: "Vulnerable individuals, seniors, infants, or severe exposure without water/shelter.",
                  border: "hover:border-red-400 border-red-200",
                  active: "border-red-500 bg-red-50/70 ring-2 ring-red-500/20",
                  badge: "CRITICAL",
                },
                {
                  level: "HIGH",
                  label: "High Urgency",
                  desc: "Supplies depleted within a few hours. Urgent community response required.",
                  border: "hover:border-orange-400 border-orange-200",
                  active: "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20",
                  badge: "HIGH",
                },
                {
                  level: "NORMAL",
                  label: "Normal / Standard Assistance",
                  desc: "Needed within 12-24 hours for non-immediate stability.",
                  border: "hover:border-blue-400 border-slate-200",
                  active: "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20",
                  badge: "NORMAL",
                },
              ].map((opt) => (
                <button
                  key={opt.level}
                  type="button"
                  onClick={() => setUrgency(opt.level as UrgencyLevel)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    urgency === opt.level ? opt.active : opt.border
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{opt.label}</span>
                    <PriorityBadge level={opt.badge} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Title & Description */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Summary Headline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drinking water urgently needed for 4 isolated seniors"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Detailed Situation Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe current circumstances, any access issues (e.g. gate code, flood level, stair access), or special needs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 10 characters.</p>
            </div>
          </div>
        )}

        {/* STEP 5: Delivery Location */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">
                Delivery Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 742 Montgomery St, San Francisco, CA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Map Coordinates</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Use Device GPS</span>
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
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Review & Confirmation */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Review Request Summary</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-2 border-t border-blue-100">
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
                  <span className="font-bold text-slate-900">{quantity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">People Affected:</span>
                  <span className="font-bold text-slate-900">{peopleAffected} individuals</span>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-100 text-xs text-slate-700">
                <span className="text-slate-400 block">Headline:</span>
                <span className="font-bold text-slate-900">{title || "(Untitled)"}</span>
              </div>

              <div className="text-xs text-slate-700">
                <span className="text-slate-400 block">Location:</span>
                <span className="font-medium text-slate-900">{address}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              Upon submission, our matching engine immediately alerts verified volunteers within radius.
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
