"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { RequestCard } from "@/components/requests/RequestCard";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateRequestModal } from "@/components/requests/CreateRequestModal";
import { ConfirmDeliveryModal } from "@/components/requests/ConfirmDeliveryModal";
import { Plus, Search, Filter, Inbox } from "lucide-react";
import { EmergencyRequestData } from "@/types";

export default function CitizenRequestsPage() {
  const [requests, setRequests] = useState<EmergencyRequestData[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    id: string;
    resource: string;
    quantity: string;
  } | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?myRequests=true");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRequests(data.data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = requests.filter((r) => {
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="CITIZEN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Emergency Requests
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track status updates and history of your requested resources
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              New Request
            </Button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, supplies, or address..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          {/* Requests Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-6 h-6" />}
              title="No requests match criteria"
              description="Try adjusting your status filter or search query to find previous emergency records."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  role="CITIZEN"
                  onConfirmDelivery={() =>
                    setConfirmModalData({
                      id: req.id,
                      resource: req.resourceType,
                      quantity: req.quantity,
                    })
                  }
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <BottomNav role="CITIZEN" />

      <CreateRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRequestCreated={fetchRequests}
      />

      {confirmModalData && (
        <ConfirmDeliveryModal
          isOpen={true}
          onClose={() => setConfirmModalData(null)}
          requestId={confirmModalData.id}
          resourceType={confirmModalData.resource}
          quantity={confirmModalData.quantity}
          onSuccess={fetchRequests}
        />
      )}
    </div>
  );
}
