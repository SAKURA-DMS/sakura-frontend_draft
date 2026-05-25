import { X, FileText } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = { Menunggu: "bg-sakura-warning/20 text-sakura-warning", Disetujui: "bg-sakura-success/20 text-sakura-success", Ditolak: "bg-destructive/20 text-destructive", Diarsipkan: "bg-muted text-muted-foreground" };

export default function DocumentListModal({ title, documents, onClose, onSelectDocument }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="text-lg font-bold text-foreground">{title}</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {documents.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada dokumen ditemukan.</p>}
          {documents.map((doc) => (
            <button key={doc.id} onClick={() => onSelectDocument(doc)} className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0"><FileText size={20} className="text-primary" /></div>
              <div className="flex-1 min-w-0"><div className="font-semibold text-sm text-foreground truncate">{doc.judul}</div><div className="text-xs text-muted-foreground">{doc.nomorDokumen} · {doc.kategori} · {doc.kelas}</div></div>
              <div className="flex flex-col items-end gap-1 shrink-0"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[doc.status]}`}>{doc.status}</span><span className="text-xs text-muted-foreground">{format(new Date(doc.tanggalUpload), "dd/MM/yyyy")}</span></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
