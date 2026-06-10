import { X, Download, ZoomIn, ZoomOut, Maximize, FileText, AlertCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";

const WATERMARK_TEXT = "SAKURA - Secure Archiving and Keeping of Unified Records for Administration";

function isImageMime(mime) {
  return !!mime && /^image\/(jpeg|png|gif|webp)/.test(mime);
}
function isPdfMime(mime) {
  return mime === "application/pdf";
}

// ── Canvas watermark untuk gambar (client-side) ───────────────────────────────
async function buildWatermarkedImageBlob(imgBlob) {
  const blobUrl = URL.createObjectURL(imgBlob);
  const img = new Image();
  img.src = blobUrl;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = () => rej(new Error("Gagal memuat gambar ke canvas"));
  });
  URL.revokeObjectURL(blobUrl);

  const canvas  = document.createElement("canvas");
  canvas.width  = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const fontSize = 15;
  ctx.save();
  ctx.font         = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle    = "#be1239";
  ctx.globalAlpha  = 0.20;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  const pw    = 620;  
  const ph    = 88;   
  const angle = -30 * (Math.PI / 180);

  const diag = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
  const cols = Math.ceil(diag / pw) + 2;
  const rows = Math.ceil(diag / ph) + 2;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(angle);
  for (let row = -rows; row <= rows; row++) {
    for (let col = -cols; col <= cols; col++) {
      ctx.fillText(WATERMARK_TEXT, col * pw, row * ph);
    }
  }
  ctx.restore();

  return new Promise((res) => canvas.toBlob(res, "image/png", 0.95));
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function PdfPreviewOverlay({ onClose, document: doc }) {
  const [zoom,             setZoom]             = useState(100);
  const [previewUrl,       setPreviewUrl]       = useState(null);
  const [mimeType,         setMimeType]         = useState(null);
  const [filename,         setFilename]         = useState(doc.judul);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloading,      setDownloading]      = useState(false);
  const [dlProgress,       setDlProgress]       = useState("");

  const fetchPreview = () => {
    setLoading(true);
    setError(null);
    api.get(`/documents/${doc.id}/preview`)
      .then(({ data }) => {
        setPreviewUrl(data.url);
        setMimeType(data.mimeType || "application/octet-stream");
        setFilename(data.filename || doc.judul);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.error || err.message || "Gagal memuat file");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPreview();
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doc.id]);

  // ── Download Original ────────────────────────────────────────────────────────
  const handleDownloadOriginal = async () => {
    setShowDownloadMenu(false);
    setDownloading(true);
    setDlProgress("Mengunduh file dari server...");
    try {
      const response = await api.get(`/documents/${doc.id}/download-stream`, {
        responseType: "blob",
      });
      let dlFilename = filename;
      const cd = response.headers?.["content-disposition"] || "";
      const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/i);
      if (match?.[1]) dlFilename = decodeURIComponent(match[1]);

      const url = URL.createObjectURL(new Blob([response.data]));
      const a   = document.createElement("a");
      a.href = url; a.download = dlFilename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mengunduh file: " + (err?.response?.data?.error || err.message));
    } finally {
      setDownloading(false); setDlProgress("");
    }
  };

  // ── Download Protected Copy ──────────────────────────────────────────────────
  const handleDownloadProtected = async () => {
    setShowDownloadMenu(false);
    setDownloading(true);
    try {
      if (isPdfMime(mimeType)) {
        setDlProgress("Server sedang mencetak watermark PDF...");
        const response = await api.get(`/documents/${doc.id}/download-protected`, { responseType: "blob" });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url; a.download = filename.replace(/\.pdf$/i, "") + "_protected.pdf";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);

      } else if (isImageMime(mimeType)) {
        setDlProgress("Mengambil gambar dari server...");
        const response = await api.get(`/documents/${doc.id}/download-protected`, { responseType: "blob" });
        setDlProgress("Menambahkan watermark pada gambar...");
        const imgBlob = new Blob([response.data], { type: mimeType });
        const resultBlob = await buildWatermarkedImageBlob(imgBlob);
        const url  = URL.createObjectURL(resultBlob);
        const a    = document.createElement("a");
        a.href = url; a.download = filename.replace(/\.[^.]+$/, "") + "_protected.png";
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);

      } else {
        alert("Tipe file ini belum mendukung Protected Copy. Gunakan Download Original.");
      }
    } catch (err) {
      alert("Gagal mengunduh Protected Copy: " + (err?.response?.data?.error || err.message || "Terjadi kesalahan"));
    } finally {
      setDownloading(false); setDlProgress("");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] bg-foreground/90 flex flex-col animate-fade-in">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-primary shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate max-w-xs">
            {doc.judul}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">
            Preview Document
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="p-2 rounded hover:bg-muted" disabled={loading || !!error}>
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(200, z + 25))} className="p-2 rounded hover:bg-muted" disabled={loading || !!error}>
            <ZoomIn size={18} />
          </button>
          <button onClick={() => setZoom(100)} className="p-2 rounded hover:bg-muted" disabled={loading || !!error}>
            <Maximize size={18} />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Download dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu((v) => !v)}
              disabled={loading || !!error || downloading}
              className="p-2 rounded hover:bg-muted flex items-center gap-1 disabled:opacity-50"
              title="Download"
            >
              {downloading
                ? <div className="w-[18px] h-[18px] border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <Download size={18} />
              }
              <span className="text-xs">▾</span>
            </button>

            {showDownloadMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
                <div className="absolute top-full right-0 mt-1 w-64 bg-card border border-border rounded-lg shadow-xl z-20">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border uppercase tracking-wide">
                    Pilih Jenis Download
                  </div>
                  <button onClick={handleDownloadOriginal} className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex flex-col gap-0.5 transition-colors">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <FileText size={14} className="text-primary" />
                      Download Original File
                    </div>
                    <div className="text-xs text-muted-foreground pl-5">File asli · Tanpa watermark</div>
                  </button>
                  <button onClick={handleDownloadProtected} className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex flex-col gap-0.5 border-t border-border rounded-b-lg transition-colors">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Shield size={14} className="text-primary" />
                      Download Protected Copy
                    </div>
                    <div className="text-xs text-muted-foreground pl-5">Watermark dicetak di file · Untuk distribusi</div>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={onClose} className="p-2 rounded hover:bg-destructive/10 text-destructive">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* ── Progress download ── */}
      {downloading && dlProgress && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="text-xs text-primary font-medium">{dlProgress}</span>
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-muted/30">

        {loading && (
          <div className="flex flex-col items-center gap-3 mt-24">
            <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Memuat dokumen dari storage...</span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-4 mt-24 max-w-md text-center">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle size={28} className="text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Gagal Memuat Dokumen</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button onClick={fetchPreview} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && previewUrl && (
          <div
            className="relative transition-transform origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <WatermarkOverlay />

            {isPdfMime(mimeType) && (
              <iframe
                src={previewUrl}
                title={`Preview ${doc.judul}`}
                className="rounded-lg shadow-2xl border-0 bg-white"
                style={{ width: "794px", height: "1123px" }}
                sandbox="allow-same-origin allow-scripts"
              />
            )}

            {isImageMime(mimeType) && (
              <img
                src={previewUrl}
                alt={`Preview ${doc.judul}`}
                className="rounded-lg shadow-2xl block"
                style={{ maxWidth: "794px", minHeight: "300px", objectFit: "contain" }}
              />
            )}

            {!isPdfMime(mimeType) && !isImageMime(mimeType) && (
              <div className="w-[794px] min-h-[400px] bg-white rounded-lg shadow-2xl flex flex-col items-center justify-center gap-4 p-8">
                <FileText size={48} className="text-muted-foreground" />
                <p className="text-center text-muted-foreground text-sm max-w-xs">
                  File bertipe <strong>{mimeType}</strong> tidak dapat ditampilkan secara inline.
                </p>
                <button onClick={handleDownloadOriginal} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                  Download File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Watermark Overlay ─────────────────────────────────────────────────────────
function WatermarkOverlay() {
  const pw = 620; 
  const ph = 88;  

  return (
    <div
      className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-lg"
      style={{ userSelect: "none" }}
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <pattern
            id="wm-pattern"
            x="0"
            y="0"
            width={pw}
            height={ph}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-30)"
          >
            {/* Baris utama */}
            <text
              x={pw / 2}
              y={ph / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              fill="#be1239"
              fillOpacity="0.20"
              letterSpacing="0.5"
            >
              {WATERMARK_TEXT}
            </text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>
    </div>
  );
}