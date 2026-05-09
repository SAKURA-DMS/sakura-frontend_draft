import { useState } from "react";
import { CheckCircle, XCircle, Clock, Eye, FileText, ArrowRight, Upload, AlertTriangle } from "lucide-react";
import AppHeader from "@/components/layout/Header";
import { useApp } from "@/contexts/AppContext";
import DocumentDetailModal from "@/components/document/DocumentDetail";
import { format, differenceInHours } from "date-fns";

const STEPS = [
  { label: "Operator TU Upload", icon: Upload, active: true },
  { label: "Antrian Review", icon: Clock, active: false },
  { label: "Disetujui / Ditolak", icon: CheckCircle, active: false },
];

export default function ApprovalPendingPage() {
  const { documents, currentUser, hasPermission, approveDocument, rejectDocument } = useApp();
  const [detailDoc, setDetailDoc] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveId, setApproveId] = useState(null);
  const [approveComment, setApproveComment] = useState("");

  const canApprove = hasPermission("documents.approve");
  const pendingDocs = documents.filter((d) => d.status === "Menunggu");

  const handleReject = (docId) => {
    if (!rejectReason.trim()) return;
    rejectDocument(docId, rejectReason.trim());
    setRejectId(null);
    setRejectReason("");
  };

  const handleApprove = (docId) => {
    approveDocument(docId, approveComment.trim() || undefined);
    setApproveId(null);
    setApproveComment("");
  };

  return (
    <>
      <AppHeader title="Antrian Persetujuan" subtitle="Dokumen menunggu review dan persetujuan" />
      <div className="p-4 sm:p-8 space-y-6 animate-fade-in">
        {/* Flow diagram */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <step.icon size={22} />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center max-w-[100px]">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && <ArrowRight size={18} className="text-muted-foreground shrink-0 mt-[-20px]" />}
              </div>
            ))}
          </div>
          <p className="text-center text-xs italic text-muted-foreground mt-3">
            Hanya Operator TU yang dapat mengunggah dokumen
          </p>
        </div>

        {/* Pending cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-sakura-warning" />
            <h3 className="font-bold text-foreground text-lg">Antrian Persetujuan</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sakura-warning/20 text-sakura-warning font-semibold">{pendingDocs.length}</span>
          </div>

          {pendingDocs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <CheckCircle size={48} className="mx-auto text-sakura-success mb-3" />
              <p className="text-foreground font-medium">Semua dokumen sudah ditinjau</p>
              <p className="text-sm text-muted-foreground mt-1">Tidak ada yang menunggu persetujuan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDocs.map((doc) => {
                const hours = differenceInHours(new Date(), new Date(doc.tanggalUpload));
                const isUrgent = doc.urgent === true;
                return (
                  <div key={doc.id} className="bg-card rounded-2xl border border-primary/[0.12] p-5 shadow-sm hover:shadow-md transition-shadow">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {doc.pengunggah.nama.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">{doc.pengunggah.nama}</span>
                          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{doc.pengunggah.role}</span>
                        </div>
                      </div>
                      {isUrgent ? (
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-sakura-warning/20 text-sakura-warning border border-sakura-warning/30 flex items-center gap-1">
                          <AlertTriangle size={12} /> URGENT
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(doc.tanggalUpload), "dd MMM yyyy, HH:mm")}
                        </span>
                      )}
                    </div>

                    {/* Title + tags */}
                    <h4 className="font-semibold text-foreground text-base mb-2">{doc.judul}</h4>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{doc.kategori}</span>
                      {doc.tahunAjaran && <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{doc.tahunAjaran}</span>}
                      {doc.kelas && doc.kelas !== "-" && <span className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{doc.kelas}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {doc.nomorDokumen} · Diunggah {format(new Date(doc.tanggalUpload), "dd MMM yyyy, HH:mm")}
                    </p>

                    {/* Notes */}
                    {doc.catatan && (
                      <div className="border-l-[3px] border-primary/30 bg-primary/[0.03] rounded-r-lg px-3.5 py-2.5 mb-3 text-[13px] text-muted-foreground">
                        {doc.catatan}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => setDetailDoc(doc)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground hover:bg-muted transition-colors">
                        <Eye size={14} /> Lihat Detail
                      </button>
                      {canApprove && (
                        <>
                          <button onClick={() => setApproveId(doc.id)} className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-sakura-success text-white text-[13px] font-semibold hover:opacity-90 transition-opacity">
                            <CheckCircle size={14} /> Setujui
                          </button>
                          <button onClick={() => setRejectId(doc.id)} className="p-2 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors" title="Tolak">
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Approve modal */}
        {approveId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setApproveId(null)}>
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sakura-success/20 flex items-center justify-center"><CheckCircle size={20} className="text-sakura-success" /></div>
                <div><h3 className="font-bold text-foreground">Konfirmasi Persetujuan</h3></div>
              </div>
              <p className="text-sm text-foreground mb-4">Apakah Anda yakin ingin menyetujui dokumen ini?</p>
              <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Komentar (opsional)..." rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setApproveId(null); setApproveComment(""); }} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button>
                <button onClick={() => handleApprove(approveId)} className="px-4 py-2 rounded-lg bg-sakura-success text-white text-sm font-semibold hover:opacity-90 flex items-center gap-2"><CheckCircle size={16} /> Setujui</button>
              </div>
            </div>
          </div>
        )}

        {/* Reject modal */}
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setRejectId(null)}>
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-foreground mb-3">Alasan Penolakan</h3>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Masukkan alasan penolakan..." rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button>
                <button onClick={() => handleReject(rejectId)} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90">Tolak Dokumen</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {detailDoc && <DocumentDetailModal document={detailDoc} onClose={() => setDetailDoc(null)} />}
    </>
  );
}
