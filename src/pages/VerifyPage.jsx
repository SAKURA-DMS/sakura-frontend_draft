import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { ShieldCheck, ShieldAlert, FileText, CheckCircle, Calendar, User, Hash, ArrowLeft, Info, QrCode } from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";
import { verifyToken } from "@/lib/verifyToken";

export default function VerifyPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { documents } = useApp();
  const navigate = useNavigate();
  const doc = documents.find((d) => d.id === Number(id));
  const token = searchParams.get("token");
  const isTokenValid = token && doc ? verifyToken(doc.id, token) : false;
  const isArchived = doc?.status === "Diarsipkan";
  const isApproved = doc?.status === "Disetujui";
  const isVerified = isTokenValid && (isArchived || isApproved);

  const approvalEntry = doc?.auditTrail?.find((e) => e.action.startsWith("Menyetujui"));

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert size={64} className="mx-auto text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Dokumen Tidak Ditemukan</h1>
          <p className="text-muted-foreground">Dokumen dengan ID tersebut tidak terdaftar dalam sistem SAKURA. Dokumen ini <strong>tidak diakui</strong> oleh sistem.</p>
          <div className="inline-block px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-semibold">❌ Dokumen Tidak Valid</div>
          <div><button onClick={() => navigate("/")} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Kembali</button></div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <ShieldAlert size={64} className="mx-auto text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Verifikasi Gagal</h1>
          <p className="text-muted-foreground">Token verifikasi tidak valid atau telah dimodifikasi. Dokumen ini <strong>tidak dapat diverifikasi</strong>.</p>
          <div className="inline-block px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-semibold">❌ Dokumen Tidak Valid</div>
          <div><button onClick={() => navigate("/")} className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Kembali</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(340 20% 97%)" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "rgba(194,58,87,0.1)" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-6 py-4">
          <img src={logoSakura} alt="SAKURA" className="w-10 h-10 rounded-xl" />
          <div>
            <div className="font-bold text-lg text-foreground">SAKURA</div>
            <div className="text-muted-foreground text-xs">Verifikasi Keaslian Dokumen</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Validity Indicator */}
        <div className={`p-6 rounded-xl border-2 text-center space-y-3 ${isVerified ? "bg-sakura-success/5 border-sakura-success/30" : "bg-destructive/5 border-destructive/30"}`}>
          {isVerified ? <CheckCircle size={48} className="mx-auto text-sakura-success" /> : <ShieldAlert size={48} className="mx-auto text-destructive" />}
          <h1 className="text-2xl font-bold text-foreground">{isVerified ? "✅ Dokumen Terverifikasi" : "❌ Dokumen Tidak Valid"}</h1>
          <p className={`text-sm font-medium ${isVerified ? "text-sakura-success" : "text-destructive"}`}>
            Integrity Status: {isVerified ? "Valid — Dokumen resmi dari sistem SAKURA" : "Invalid"}
          </p>
          <p className="text-xs text-muted-foreground">
            Tanggal Verifikasi: {format(new Date(), "dd MMMM yyyy, HH:mm")}
          </p>
        </div>

        {/* Document Details */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" /> Detail Dokumen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs flex items-center gap-1"><Hash size={12} /> Document ID</div>
              <div className="font-medium text-foreground">{doc.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs flex items-center gap-1"><Hash size={12} /> Nomor Dokumen</div>
              <div className="font-medium text-foreground">{doc.nomorDokumen}</div>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <div className="text-muted-foreground text-xs flex items-center gap-1"><FileText size={12} /> Judul Dokumen</div>
              <div className="font-bold text-foreground text-lg">{doc.judul}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Status Persetujuan</div>
              <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${isVerified ? "bg-sakura-success/20 text-sakura-success" : "bg-sakura-warning/20 text-sakura-warning"}`}>
                {doc.status}
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Kategori</div>
              <div className="font-medium text-foreground">{doc.kategori}</div>
            </div>
            {approvalEntry && (
              <>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs flex items-center gap-1"><Calendar size={12} /> Tanggal Persetujuan</div>
                  <div className="font-medium text-foreground">{format(new Date(approvalEntry.time), "dd MMMM yyyy, HH:mm")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground text-xs flex items-center gap-1"><User size={12} /> Disetujui Oleh</div>
                  <div className="font-medium text-foreground">{approvalEntry.user.nama}</div>
                </div>
              </>
            )}
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs flex items-center gap-1"><Calendar size={12} /> Tanggal Verifikasi</div>
              <div className="font-medium text-foreground">{format(new Date(), "dd MMMM yyyy, HH:mm")}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">Keterangan Validitas</div>
              <div className={`font-semibold ${isVerified ? "text-sakura-success" : "text-destructive"}`}>
                {isVerified ? "Dokumen ini sah dan terdaftar di sistem SAKURA" : "Dokumen tidak dapat diverifikasi"}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {isVerified && (
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-foreground">Preview Dokumen</h2>
            <div className="relative bg-muted/30 rounded-lg p-8 min-h-[300px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="text-primary/10 text-6xl font-extrabold rotate-[-30deg] whitespace-nowrap">VERIFIED ARCHIVE COPY</div>
              </div>
              <div className="text-center z-10 space-y-3">
                <FileText size={64} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview dokumen dalam mode read-only</p>
                <p className="text-xs text-muted-foreground">File: {doc.judul}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Dokumen ini terdaftar di database SAKURA, telah melewati proses persetujuan, dan memiliki status arsip resmi.
            </p>
          </div>
        )}

        {/* Explanation Section */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Info size={18} className="text-primary" /> Penjelasan Verifikasi Dokumen SAKURA
          </h2>
          <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
            <p>
              QR Code pada dokumen ini digunakan sebagai alat verifikasi keaslian dokumen dalam sistem <strong className="text-foreground">SAKURA</strong> (Secure Archiving and Keeping of Unified Records for Administration).
            </p>
            <p>
              Ketika QR Code dipindai menggunakan kamera atau scanner, sistem akan memeriksa <em>document ID</em> yang tersimpan di database dan menampilkan informasi terkait dokumen tersebut.
            </p>
            <p>
              Melalui proses ini, pengguna dapat memastikan bahwa dokumen benar-benar diterbitkan oleh sistem SAKURA dan tidak mengalami pemalsuan atau perubahan.
            </p>
            <p>
              Jika dokumen tidak ditemukan atau statusnya tidak valid, maka dokumen tersebut <strong className="text-destructive">tidak diakui</strong> oleh sistem.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs">
              <QrCode size={14} className="text-primary" />
              <span className="text-foreground font-medium">Verifikasi menggunakan signed token untuk mencegah pemalsuan QR Code.</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="text-center">
          <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ArrowLeft size={14} /> Kembali ke halaman utama
          </button>
        </div>
        <p className="text-center text-xs text-muted-foreground">© 2026 SAKURA · SMP Negeri 4 Cikarang Barat</p>
      </div>
    </div>
  );
}
