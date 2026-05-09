import { useState, useMemo } from "react";
import { FileText, Clock, CheckCircle, Archive, XCircle, Eye, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import { DocumentList } from "@/components/document/DocumentDetail";
import DocumentDetailModal from "@/components/document/DocumentDetail";
import { useApp } from "@/contexts/AppContext";
import { format, differenceInHours } from "date-fns";

const TABS = [
  { key: "ringkasan", label: "Ringkasan", icon: Archive },
  { key: "persetujuan", label: "Persetujuan", icon: CheckCircle },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { documents, currentUser, hasPermission, approveDocument, rejectDocument } = useApp();
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [listModal, setListModal] = useState(null);
  const [detailDoc, setDetailDoc] = useState(null);

  const visibleDocs = useMemo(() => {
    if (currentUser.role === "Guru") {
      return documents.filter((d) => d.pengunggah.id === currentUser.id);
    }
    return documents;
  }, [documents, currentUser]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Ringkasan aktivitas dokumen" />

      <div className="p-6 lg:p-8 space-y-6" style={{ background: "hsl(340 20% 97%)" }}>
        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{ background: "linear-gradient(135deg, #FFF0F3 0%, #FFD6E0 100%)" }}
        >
          {/* Subtle petal SVG overlay */}
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08]" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            {[0, 72, 144, 216, 288].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const tx = 60 + Math.cos(rad) * 30;
              const ty = 60 + Math.sin(rad) * 30;
              return <ellipse key={angle} cx={tx} cy={ty} rx="18" ry="28" fill="#C23A57" transform={`rotate(${angle} ${tx} ${ty})`} />;
            })}
            <circle cx="60" cy="60" r="8" fill="#E8607A" />
          </svg>
          <div className="relative">
            <p className="text-primary/70 text-sm font-medium">{getGreeting()},</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mt-1">{currentUser.nama}</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-lg">
              Kelola dokumen, pantau status persetujuan, dan arsipkan dokumen administrasi sekolah.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "ringkasan" && (
          <OverviewTab
            visibleDocs={visibleDocs}
            onOpenList={(title, docs) => setListModal({ title, docs })}
            onSelectDoc={setDetailDoc}
          />
        )}
        {activeTab === "persetujuan" && (
          <PersetujuanTab
            documents={documents}
            canApprove={hasPermission("documents.approve")}
            approveDocument={approveDocument}
            rejectDocument={rejectDocument}
            onSelectDoc={setDetailDoc}
          />
        )}
      </div>

      {listModal && !detailDoc && (
        <DocumentList title={listModal.title} documents={listModal.docs} onClose={() => setListModal(null)} onSelectDocument={(doc) => setDetailDoc(doc)} />
      )}
      {detailDoc && <DocumentDetailModal document={detailDoc} onClose={() => setDetailDoc(null)} />}
    </>
  );
}

function OverviewTab({ visibleDocs, onOpenList, onSelectDoc }) {
  const counts = {
    total: visibleDocs.length,
    menunggu: visibleDocs.filter((d) => d.status === "Menunggu").length,
    disetujui: visibleDocs.filter((d) => d.status === "Disetujui").length,
    ditolak: visibleDocs.filter((d) => d.status === "Ditolak").length,
    diarsipkan: visibleDocs.filter((d) => d.status === "Diarsipkan").length,
  };

  const handleChartClick = (date, status) => {
    let matched = visibleDocs.filter((d) => d.tanggalUpload.startsWith(date));
    if (status && status !== "Upload") {
      const statusMap = {
        "Disetujui": ["Disetujui"],
        "Ditolak": ["Ditolak"],
        "Menunggu": ["Menunggu"],
        "Diarsipkan": ["Diarsipkan"],
      };
      const allowedStatuses = statusMap[status] || [];
      matched = matched.filter((d) => allowedStatuses.includes(d.status));
    }
    const label = status ? `Dokumen ${status} tanggal ${date}` : `Dokumen tanggal ${date}`;
    onOpenList(label, matched.length > 0 ? matched : visibleDocs.slice(0, 3));
  };

  const handleStatusClick = (status) => {
    const statusMap = { "Disetujui": "Disetujui", "Ditolak": "Ditolak", "Menunggu": "Menunggu", "Diarsipkan": "Diarsipkan", "Upload": "all" };
    const key = statusMap[status];
    if (key === "all") {
      onOpenList(`Semua Dokumen (Upload)`, visibleDocs);
    } else if (key) {
      onOpenList(`Dokumen ${status}`, visibleDocs.filter((d) => d.status === key));
    }
  };

  const recentDocs = [...visibleDocs].sort((a, b) => new Date(b.tanggalUpload).getTime() - new Date(a.tanggalUpload).getTime()).slice(0, 5);

  const recentActivity = useMemo(() => {
    const entries = [];
    visibleDocs.forEach((doc) => {
      doc.auditTrail.forEach((e) => {
        entries.push({ docTitle: doc.judul, time: e.time, userName: e.user.nama, userAvatar: e.user.avatar, userRole: e.user.role, action: e.action });
      });
    });
    return entries.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);
  }, [visibleDocs]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardCard title="Total Dokumen" value={counts.total} icon={FileText} onClick={() => onOpenList("Semua Dokumen", visibleDocs)} />
        <DashboardCard title="Menunggu" value={counts.menunggu} icon={Clock} variant="warning" onClick={() => onOpenList("Dokumen Menunggu", visibleDocs.filter((d) => d.status === "Menunggu"))} />
        <DashboardCard title="Disetujui" value={counts.disetujui} icon={CheckCircle} variant="success" onClick={() => onOpenList("Dokumen Disetujui", visibleDocs.filter((d) => d.status === "Disetujui"))} />
        <DashboardCard title="Ditolak" value={counts.ditolak} icon={XCircle} variant="default" onClick={() => onOpenList("Dokumen Ditolak", visibleDocs.filter((d) => d.status === "Ditolak"))} />
        <DashboardCard title="Diarsipkan" value={counts.diarsipkan} icon={Archive} variant="muted" onClick={() => onOpenList("Dokumen Diarsipkan", visibleDocs.filter((d) => d.status === "Diarsipkan"))} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ActivityChart onDateClick={handleChartClick} onStatusClick={handleStatusClick} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            Dokumen Terbaru
          </h3>
          <div className="space-y-1">
            {recentDocs.map((doc) => (
              <button key={doc.id} onClick={() => onSelectDoc(doc)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all duration-200 text-left group">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/12 transition-colors">
                  <FileText size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-foreground truncate">{doc.judul}</div>
                  <div className="text-xs text-muted-foreground">{doc.nomorDokumen} · {doc.kategori}</div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  doc.status === "Disetujui" ? "bg-sakura-success/15 text-sakura-success" :
                  doc.status === "Menunggu" ? "bg-sakura-warning/15 text-sakura-warning" :
                  doc.status === "Ditolak" ? "bg-destructive/15 text-destructive" :
                  "bg-muted text-muted-foreground"
                }`}>{doc.status}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <img src={act.userAvatar} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-semibold text-foreground">{act.userName}</span>
                    <span className="text-[11px] text-muted-foreground">· {act.userRole}</span>
                  </div>
                  <div className="text-[13px] text-foreground/80">{act.action}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{act.docTitle} · {format(new Date(act.time), "dd/MM/yyyy HH:mm")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PersetujuanTab({ documents, canApprove, approveDocument, rejectDocument, onSelectDoc }) {
  const [approveId, setApproveId] = useState(null);
  const [approveComment, setApproveComment] = useState("");
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingDocs = documents.filter((d) => d.status === "Menunggu");

  const getUrgency = (doc) => {
    const hours = differenceInHours(new Date(), new Date(doc.tanggalUpload));
    if (hours > 72) return { label: "Urgent", color: "bg-destructive/15 text-destructive" };
    if (hours > 24) return { label: "Pending", color: "bg-sakura-warning/15 text-sakura-warning" };
    return { label: "Baru", color: "bg-sakura-success/15 text-sakura-success" };
  };

  const handleApprove = (docId) => {
    approveDocument(docId, approveComment.trim() || undefined);
    setApproveId(null);
    setApproveComment("");
  };

  const handleReject = (docId) => {
    if (!rejectReason.trim()) return;
    rejectDocument(docId, rejectReason.trim());
    setRejectId(null);
    setRejectReason("");
  };

  if (pendingDocs.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-12 text-center">
        <CheckCircle size={48} className="mx-auto text-sakura-success mb-3" />
        <p className="text-foreground font-semibold">Tidak ada dokumen yang menunggu persetujuan</p>
        <p className="text-sm text-muted-foreground mt-1">Semua dokumen sudah ditinjau.</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pendingDocs.map((doc) => {
          const urgency = getUrgency(doc);
          return (
            <motion.div key={doc.id} variants={fadeUp} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-card-hover transition-shadow duration-300">
              <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <img src={doc.pengunggah.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{doc.pengunggah.nama}</div>
                    <div className="text-[11px] text-muted-foreground">{doc.pengunggah.role}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${urgency.color}`}>
                  {urgency.label}
                </span>
              </div>

              <div className="p-5 space-y-3">
                <h4 className="font-bold text-foreground text-[13px] line-clamp-2">{doc.judul}</h4>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">{doc.kategori}</span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">{doc.tahunAjaran}</span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground font-medium">{doc.kelas}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {doc.nomorDokumen} · {format(new Date(doc.tanggalUpload), "dd MMM yyyy")}
                </div>
                {doc.catatan && (
                  <div className="text-[11px] px-2.5 py-1.5 rounded-lg bg-sakura-warning/10 text-sakura-warning border border-sakura-warning/20">
                    ⚠ {doc.catatan}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
                <button
                  onClick={() => onSelectDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-[12px] font-medium hover:bg-muted transition-colors"
                >
                  <Eye size={14} /> Review
                </button>
                {canApprove && (
                  <>
                    <button
                      onClick={() => setApproveId(doc.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-sakura-success text-white text-[12px] font-bold hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle size={14} /> Setujui
                    </button>
                    <button
                      onClick={() => setRejectId(doc.id)}
                      className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <XCircle size={14} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {approveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 glass" onClick={() => setApproveId(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl shadow-elevated w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-3">Konfirmasi Persetujuan</h3>
            <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Komentar (opsional)..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setApproveId(null); setApproveComment(""); }} className="px-4 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Batal</button>
              <button onClick={() => handleApprove(approveId)} className="px-4 py-2 rounded-lg bg-sakura-success text-white text-sm font-bold hover:opacity-90 transition-opacity">Setujui</button>
            </div>
          </motion.div>
        </div>
      )}

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 glass" onClick={() => setRejectId(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl shadow-elevated w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-3">Alasan Penolakan</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Masukkan alasan penolakan..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectId(null)} className="px-4 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Batal</button>
              <button onClick={() => handleReject(rejectId)} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 transition-opacity">Tolak</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
