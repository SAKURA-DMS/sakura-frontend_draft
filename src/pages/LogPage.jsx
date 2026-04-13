import { useState, useMemo } from "react";
import { Search, RotateCcw, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import AppHeader from "@/components/layout/AppHeader";
import { useApp } from "@/contexts/AppContext";

export default function LogPage() {
  const { documents } = useApp();
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("Semua");

  const allLogs = useMemo(() => {
    const logs = [];
    documents.forEach((doc) => {
      doc.auditTrail.forEach((entry) => {
        logs.push({ docId: doc.id, docTitle: doc.judul, time: entry.time, userName: entry.user.nama, userAvatar: entry.user.avatar, userRole: entry.user.role, action: entry.action });
      });
    });
    return logs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }, [documents]);

  const filtered = useMemo(() => {
    return allLogs.filter((log) => {
      if (filterAction !== "Semua" && !log.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        return log.userName.toLowerCase().includes(q) || log.docTitle.toLowerCase().includes(q) || log.action.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allLogs, search, filterAction]);

  return (
    <>
      <AppHeader title="Log Sistem" subtitle="Catatan aktivitas seluruh dokumen" />
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={22} className="text-primary" />
          <h2 className="text-xl font-bold text-foreground">Jejak Aktivitas Global</h2>
          <span className="text-xs text-muted-foreground">({allLogs.length} entri)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, dokumen, atau aktivitas..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="Semua">Semua Aktivitas</option>
            <option value="Mengunggah">Unggah</option>
            <option value="Melihat">Lihat</option>
            <option value="Menyetujui">Setujui</option>
            <option value="Menolak">Tolak</option>
            <option value="Mengarsipkan">Arsipkan</option>
            <option value="Catatan">Catatan Admin</option>
          </select>
          <button onClick={() => { setSearch(""); setFilterAction("Semua"); }} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-input text-sm hover:bg-muted transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada log ditemukan.</p>}
            {filtered.map((log, i) => (
              <div key={`${log.docId}-${log.time}-${i}`} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                <img src={log.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{log.userName}</span>
                    <span className="text-xs text-muted-foreground">— {log.userRole}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{format(new Date(log.time), "yyyy-MM-dd HH:mm")}</span>
                  </div>
                  <div className={`text-sm mt-0.5 ${log.action.startsWith("Catatan Admin") ? "text-accent font-medium italic" : "text-foreground"}`}>{log.action}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><FileText size={12} /> {log.docTitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
