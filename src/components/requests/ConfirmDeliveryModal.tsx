"use client";

import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  resourceType: string;
  quantity: string;
  onSuccess?: () => void;
}

export function ConfirmDeliveryModal({
  isOpen,
  onClose,
  requestId,
  resourceType,
  quantity,
  onSuccess,
}: ConfirmDeliveryModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const handleConfirmReceived = async () => {
    setIsConfirming(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONFIRM_DELIVERY" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Supplies confirmed received! Request successfully resolved.");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error.message || "Failed to confirm delivery");
      }
    } catch (err: any) {
      toast.error("Confirmation error: " + err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReportProblem = async () => {
    if (!disputeReason.trim() || disputeReason.length < 5) {
      toast.error("Please explain the delivery issue in at least 5 characters");
      return;
    }

    setIsSubmittingDispute(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.warning("Delivery dispute filed. An emergency admin is reviewing.");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.error.message || "Failed to report problem");
      }
    } catch (err: any) {
      toast.error("Dispute error: " + err.message);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Emergency Supplies Delivery"
      description={`Request for ${quantity} of ${resourceType}`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {!showDisputeInput ? (
          <>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-slate-900 text-base">
                Your supplies were marked as delivered.
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A volunteer responder indicated they completed delivery of your emergency resources. Did you receive everything safely?
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="success"
                size="lg"
                className="w-full font-bold"
                isLoading={isConfirming}
                leftIcon={<ShieldCheck className="w-5 h-5" />}
                onClick={handleConfirmReceived}
              >
                Yes, I Received Everything
              </Button>

              <button
                type="button"
                onClick={() => setShowDisputeInput(true)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold py-2 text-center transition-colors"
              >
                No, I did not receive it or there is a problem
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Report Delivery Problem</span>
              </div>
              <p className="text-[11px] text-amber-700">
                Please describe what happened (e.g. wrong location, incomplete quantity, unable to access).
              </p>
            </div>

            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Explain the issue for the emergency command center..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisputeInput(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isSubmittingDispute}
                onClick={handleReportProblem}
              >
                Submit Problem Report
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
