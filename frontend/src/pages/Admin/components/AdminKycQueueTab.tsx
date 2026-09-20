import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RotateCw, User, FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { handleSuccess, handleError } from "../../../utils";

const AdminKycQueueTab = () => {
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchPendingKyc = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/admin/kyc/pending`, {
        headers: { Authorization: token || "" },
      });
      const data = await res.json();
      if (data.success) {
        setPendingList(data.data || []);
      } else {
        handleError(data.message || "Failed to load KYC verification queue");
      }
    } catch (err) {
      console.error(err);
      handleError("Network error fetching KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  const handleDecision = async (id: number, decision: "approved" | "rejected") => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BASE_API_URL}/admin/kyc/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: token || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminStatus: decision }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        handleSuccess(`KYC submission ${decision} successfully`);
        setPendingList((prev) => prev.filter((item) => item.id !== id));
      } else {
        handleError(data.message || "Failed to process KYC decision");
      }
    } catch (err) {
      console.error(err);
      handleError("Network error processing decision");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            KYC Identity Verification Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Review identity document scans, Didit biometric checks, and approve/reject creator badges
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingKyc}
          disabled={loading}
          className="cursor-pointer gap-1.5 rounded-xl self-start sm:self-auto"
        >
          <RotateCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Queue Content */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground text-xs">
              <RotateCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Loading pending KYC submissions...
            </div>
          ) : pendingList.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-foreground">KYC Queue is Clear!</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                All submitted identity verifications have been reviewed and decided.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pendingList.map((item) => (
                <div key={item.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {(item.user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{item.user?.name || "User"}</p>
                        <p className="text-[11px] text-muted-foreground">@{item.user?.username} · {item.user?.email}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold text-amber-700 bg-amber-50 border-amber-200 ml-2">
                        Didit: {item.didit_status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-muted/40 p-3 rounded-xl border border-border">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Extracted Name</span>
                        <p className="font-semibold text-foreground">{item.extracted_name || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Doc Number</span>
                        <p className="font-semibold text-foreground">{item.document_number || "Verified via OCR"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">Date of Birth</span>
                        <p className="font-semibold text-foreground">{item.extracted_dob || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Decision Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button
                      size="sm"
                      onClick={() => handleDecision(item.id, "approved")}
                      disabled={actionLoading === item.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer gap-1 text-xs rounded-xl"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve KYC</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecision(item.id, "rejected")}
                      disabled={actionLoading === item.id}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 font-semibold cursor-pointer gap-1 text-xs rounded-xl"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminKycQueueTab;
