"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { FileText, ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AuditLogData } from "@/types";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-logs?limit=100");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLogs(data.data.logs || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                <span>Immutable Operational Audit Trail</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Full chronological event logs of all state changes, authorizations, dispatches, and completions
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                setIsLoading(true);
                fetchLogs();
              }}
            >
              Refresh Logs
            </Button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Actor</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Entity</th>
                    <th className="py-3.5 px-4">Old Value</th>
                    <th className="py-3.5 px-4">New Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                        Loading audit events...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="font-bold text-slate-900">{log.actorName}</span>
                          <span className="text-[10px] text-slate-400 block">{log.actorRole}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-600">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {log.entity} <span className="text-[10px] text-slate-400">({log.entityId.slice(0, 8)}...)</span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {log.oldValue || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-800 max-w-xs truncate font-semibold">
                          {log.newValue || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="ADMIN" />
    </div>
  );
}
