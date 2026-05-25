import { useState } from "react";
import { CheckCircle, XCircle, Archive } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useApp } from "@/contexts/AppContext";
import DocumentDetailModal from "@/components/modals/DocumentDetailModal";
import { format } from "date-fns";

export default function ApprovalApprovedPage() {
  const { documents } = useApp();
  const [detailDoc, setDetailDoc] = useState(null);

  const decided = documents
    .filter((d) => d.status === "Disetujui" || d.status === "Ditolak" || d.status === "Diarsipkan")
    .sort((a, b) => new Date(b.tanggalEdit) - new Date(a.tanggalEdit));

  return (
    <>
      <AppHeader title="Keputusan Persetujuan" subtitle="Riwayat dokumen yang telah disetujui atau ditolak" />
      <div className="p-4 sm:p-8 animate-fade-in">
        {decided.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <p className="text-muted-foreground">Belum ada keputusan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {decided.map((doc) => (
              <button key={doc.id} onClick={() => setDetailDoc(doc)} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-left">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  doc.status === "Ditolak" ? "bg-destructive/20 text-destructive" :
                  doc.status === "Diarsipkan" ? "bg-muted text-muted-foreground" :
                  "bg-sakura-success/20 text-sakura-success"
                }`}>
                  {doc.status === "Ditolak" ? <XCircle size={18} /> : doc.status === "Diarsipkan" ? <Archive size={18} /> : <CheckCircle size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{doc.judul}</div>
                  <div className="text-xs text-muted-foreground">{doc.nomorDokumen} · {doc.pengunggah.nama}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{format(new Date(doc.tanggalEdit), "dd MMM yyyy")}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  doc.status === "Ditolak" ? "bg-destructive/20 text-destructive" :
                  doc.status === "Diarsipkan" ? "bg-muted text-muted-foreground" :
                  "bg-sakura-success/20 text-sakura-success"
                }`}>{doc.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {detailDoc && <DocumentDetailModal document={detailDoc} onClose={() => setDetailDoc(null)} />}
    </>
  );
}
