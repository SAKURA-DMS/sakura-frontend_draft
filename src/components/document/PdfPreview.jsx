import { X, Download, ZoomIn, ZoomOut, Maximize, FileText, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/apiClient";

function isImageMime(mime) {
  return !!mime && /^image\/(jpeg|png|gif|webp)/.test(mime);
}
function isPdfMime(mime) {
  return mime === "application/pdf";
}

export default function PdfPreviewOverlay({ onClose, document: doc }) {
  const [zoom,       setZoom]       = useState(100);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mimeType,   setMimeType]   = useState(null);
  const [filename,   setFilename]   = useState(doc.judul);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    setDownloading(true);
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
      setDownloading(false);
    }
  };

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

          <button
            onClick={handleDownload}
            disabled={loading || !!error || downloading}
            className="p-2 rounded hover:bg-muted disabled:opacity-50"
            title="Download"
          >
            {downloading
              ? <div className="w-[18px] h-[18px] border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <Download size={18} />
            }
          </button>

          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={onClose} className="p-2 rounded hover:bg-destructive/10 text-destructive">
            <X size={20} />
          </button>
        </div>
      </div>

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
            className="transition-transform origin-top"
            style={{ transform: `scale(${zoom / 100})` }}
          >
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
                <button onClick={handleDownload} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
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