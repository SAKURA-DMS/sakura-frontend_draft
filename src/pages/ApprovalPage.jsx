import { useState } from "react";
import { CheckCircle, XCircle, Clock, Eye, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import AppHeader from "@/components/layout/Header";
import { useApp } from "@/contexts/AppContext";
import DocumentDetailModal from "@/components/document/DocumentDetail";
import PdfPreviewOverlay from "@/components/document/PdfPreview";
import { format, differenceInHours } from "date-fns";

const STEPS = [
  { label: "Staff / Guru Upload", icon: FileText },
  { label: "Antrian Persetujuan", icon: Clock },
  { label: "Disetujui / Ditolak", icon: CheckCircle },
];

export default function ApprovalPage() {
  const { documents, currentUser, hasPermission, approveDocument, rejectDocument } = useApp();
  const [detailDoc, setDetailDoc] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveId, setApproveId] = useState(null);
  const [approveComment, setApproveComment] = useState("");

  const canApprove = hasPermission("documents.approve");
  const pendingDocs = documents.filter((d) => d.status === "Menunggu");
  const recentDecisions = documents.filter((d) => d.status === "Disetujui" || d.status === "Ditolak" || d.status === "Diarsipkan").slice(0, 6);

  const getUrgency = (doc) => {
    const hours = differenceInHours(new Date(), new Date(doc.tanggalUpload));
    if (hours > 72) return { label: "Urgent", color: "bg-destructive/20 text-destructive", icon: AlertTriangle };
    if (hours > 24) return { label: "Pending", color: "bg-sakura-warning/20 text-sakura-warning", icon: Clock };
    return { label: "Baru", color: "bg-sakura-success/20 text-sakura-success", icon: Clock };
  };

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
      <AppHeader title="Alur Persetujuan" subtitle="Workflow persetujuan dokumen" />
      <div className="p-4 sm:p-8 space-y-6 animate-fade-in">
        {/* Workflow visual */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-foreground mb-4">Alur Persetujuan Dokumen</h3>
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    i === 0 ? "bg-primary text-primary-foreground" :
                    i === STEPS.length - 1 ? "bg-sakura-success/20 text-sakura-success" :
                    "bg-secondary text-primary"
                  }`}>
                    <step.icon size={22} />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center max-w-[100px]">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && <ArrowRight size={20} className="text-muted-foreground shrink-0 mt-[-20px]" />}
              </div>
            ))}
          </div>
        </div>

        {/* Pending queue */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pendingDocs.map((doc) => {
                const urgency = getUrgency(doc);
                return (
                  <div key={doc.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                      <div className="flex items-center gap-2.5">
                        <img src={doc.pengunggah.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-foreground">{doc.pengunggah.nama}</div>
                          <div className="text-xs text-muted-foreground">{doc.pengunggah.role}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${urgency.color}`}>
                        {urgency.label}
                      </span>
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-bold text-foreground leading-snug line-clamp-2">{doc.judul}</h4>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-medium">{doc.kategori}</span>
                        <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-medium">{doc.tahunAjaran}</span>
                        {doc.kelas && <span className="px-2 py-0.5 rounded bg-secondary text-foreground font-medium">{doc.kelas}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.nomorDokumen} · Diunggah {format(new Date(doc.tanggalUpload), "dd MMM yyyy, HH:mm")}
                      </div>
                      {doc.catatan && (
                        <div className="text-xs px-2.5 py-1.5 rounded-lg bg-sakura-warning/10 border border-sakura-warning/20 text-sakura-warning">
                          ⚠ {doc.catatan}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 px-5 py-3 border-t border-border bg-muted/10">
                      <button
                        onClick={() => setDetailDoc(doc)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Eye size={14} /> Lihat Detail
                      </button>
                      {canApprove && (
                        <>
                          <button
                            onClick={() => setApproveId(doc.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-sakura-success text-white text-xs font-bold hover:opacity-90 transition-opacity"
                          >
                            <CheckCircle size={14} /> Setujui
                          </button>
                          <button
                            onClick={() => setRejectId(doc.id)}
                            className="p-2.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            title="Tolak"
                          >
                            <XCircle size={14} />
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

        {/* Approve confirmation modal */}
        {approveId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setApproveId(null)}>
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sakura-success/20 flex items-center justify-center">
                  <CheckCircle size={20} className="text-sakura-success" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Konfirmasi Persetujuan</h3>
                  <p className="text-xs text-muted-foreground">Persetujuan oleh sistem</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-4">Apakah Anda yakin ingin menyetujui dokumen ini? Dokumen akan otomatis masuk ke arsip setelah disetujui.</p>
              <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Komentar persetujuan (opsional)..." rows={2} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setApproveId(null); setApproveComment(""); }} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button>
                <button onClick={() => handleApprove(approveId)} className="px-4 py-2 rounded-lg bg-sakura-success text-white text-sm font-semibold hover:opacity-90 flex items-center gap-2">
                  <CheckCircle size={16} /> Setujui
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject reason modal */}
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setRejectId(null)}>
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-foreground mb-3">Alasan Penolakan</h3>
              <p className="text-sm text-muted-foreground mb-3">Dokumen akan dikembalikan ke pengirim beserta catatan revisi.</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Masukkan alasan penolakan dokumen..." rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button>
                <button onClick={() => handleReject(rejectId)} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90">Tolak Dokumen</button>
              </div>
            </div>
          </div>
        )}

        {/* Recent decisions */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-foreground mb-4">Keputusan Terbaru</h3>
          {recentDecisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada keputusan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentDecisions.map((doc) => (
                <button key={doc.id} onClick={() => setDetailDoc(doc)} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${doc.status === "Ditolak" ? "bg-destructive/20 text-destructive" : "bg-sakura-success/20 text-sakura-success"}`}>
                    {doc.status === "Ditolak" ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{doc.judul}</div>
                    <div className="text-xs text-muted-foreground">{doc.nomorDokumen} · {doc.pengunggah.nama}</div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${doc.status === "Ditolak" ? "bg-destructive/20 text-destructive" : "bg-sakura-success/20 text-sakura-success"}`}>
                    {doc.status === "Diarsipkan" ? "Disetujui" : doc.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {detailDoc && <DocumentDetailModal document={detailDoc} onClose={() => setDetailDoc(null)} />}
    </>
  );
}
