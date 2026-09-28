"use client";

import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { PriorityBadge, ResourceBadge } from "../ui/Badge";
import {
  Activity,
  AlertTriangle,
  Users,
  Droplets,
  Clock,
  ShieldCheck,
  Cpu,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import { EmergencyRequestData } from "@/types";
import { PriorityService } from "@/lib/services/priority.service";

interface PriorityRationaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: EmergencyRequestData;
}

export function PriorityRationaleModal({
  isOpen,
  onClose,
  request,
}: PriorityRationaleModalProps) {
  const calculation = PriorityService.calculate({
    urgency: request.urgency,
    peopleAffected: request.peopleAffected,
    resourceType: request.resourceType,
    createdAt: new Date(request.createdAt),
  });

  const { urgencyScore, peopleScore, resourceScore, waitScore } = calculation.breakdown;
  const totalScore = calculation.priorityScore;
  const level = calculation.priorityLevel;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Intelligent Priority Breakdown"
      description="Algorithmic rationale and mathematical factor weighting used to triage this emergency incident."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Incident Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <ResourceBadge type={request.resourceType} />
              <PriorityBadge level={level} />
            </div>
            <h3 className="font-bold text-base text-slate-100">{request.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{request.address}</p>
          </div>

          <div className="bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/80 text-center sm:text-right flex-shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
              Calculated Score
            </span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span
                className={`text-3xl font-black ${
                  level === "CRITICAL"
                    ? "text-rose-400"
                    : level === "HIGH"
                    ? "text-amber-400"
                    : "text-blue-400"
                }`}
              >
                {totalScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Scoring Factor Breakdown */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Multi-Factor Algorithmic Weights</span>
          </h4>

          {/* Factor 1: Urgency Base */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-800">
                  Reported Acute Severity ({request.urgency})
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                +{urgencyScore} / 40 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-rose-500 h-full rounded-full transition-all"
                style={{ width: `${(urgencyScore / 40) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluates initial distress signal. Critical reports (40 pts) represent immediate threats to human life or bodily safety.
            </p>
          </div>

          {/* Factor 2: People Affected */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-slate-800">
                  Population Scale ({request.peopleAffected} individuals)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                +{peopleScore} / 30 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${(peopleScore / 30) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Exponential weighting for group vulnerability: 20+ persons (30 pts), 10+ persons (24 pts), 5+ persons (18 pts), 2-4 persons (10 pts), individual (5 pts).
            </p>
          </div>

          {/* Factor 3: Resource Mortality Index */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800">
                  Resource Mortality Weight ({request.resourceType})
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                +{resourceScore} / 20 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${(resourceScore / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Ranked by physiological urgency: Potable Water (20 pts), Emergency Shelter (18 pts), Ration Kits (15 pts), Evacuation Transport (12 pts), General Supplies (8 pts).
            </p>
          </div>

          {/* Factor 4: Wait Time Aging */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  Starvation Prevention (Wait-Time Aging)
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                +{waitScore} / 10 pts
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-amber-500 h-full rounded-full transition-all"
                style={{ width: `${(waitScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Adds +2.5 points for every unaddressed hour in queue to ensure normal requests are not perpetually starved by newer incoming requests.
            </p>
          </div>
        </div>

        {/* Triage Decision Matrix */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automated Operational Triage Thresholds</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            <div
              className={`p-2 rounded-lg border ${
                level === "CRITICAL"
                  ? "bg-rose-50 border-rose-200 font-semibold text-rose-900"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <span className="block font-bold">Critical (Score 75-100)</span>
              <span>Immediate beacon on map; prioritizes instant volunteer push.</span>
            </div>
            <div
              className={`p-2 rounded-lg border ${
                level === "HIGH"
                  ? "bg-amber-50 border-amber-200 font-semibold text-amber-900"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <span className="block font-bold">High (Score 45-74)</span>
              <span>Elevated queue placement; dispatches within standard cycle.</span>
            </div>
            <div
              className={`p-2 rounded-lg border ${
                level === "NORMAL"
                  ? "bg-blue-50 border-blue-200 font-semibold text-blue-900"
                  : "bg-white border-slate-200 text-slate-600"
              }`}
            >
              <span className="block font-bold">Normal (Score 10-44)</span>
              <span>Standard community fulfillment; subject to wait-aging escalation.</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Rationale
          </Button>
        </div>
      </div>
    </Modal>
  );
}
