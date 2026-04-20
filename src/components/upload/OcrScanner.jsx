import { useState, useRef } from "react";
import { Scan, Upload, AlertTriangle, Check, RotateCcw, Copy } from "lucide-react";
import Tesseract from "tesseract.js";

const SUPPORTED_DOCS = [
  { label: "Ijazah SMP/MTs", full: true },
  { label: "Sertifikat & Diklat", full: true },
  { label: "Surat Keterangan", full: true },
  { label: "SK & Surat Edaran", full: true },
  { label: "Buku Induk (terbatas)", full: false },
  { label: "Buku Klapper (terbatas)", full: false },
];

const OCR_PATTERNS = [
  { key: "Nama", regex: /nama\s*:?\s*(.+)/i },
  { key: "NIP", regex: /nip\s*:?\s*([\d\s]+)/i },
  { key: "NIS/NISN", regex: /ni[sn]\s*:?\s*([\d]+)/i },
  { key: "Kelas", regex: /kelas\s*:?\s*(.+)/i },
  { key: "Tanggal", regex: /tanggal\s*:?\s*(.+)/i },
  { key: "Nomor Surat", regex: /no(?:mor)?\s*:?\s*(.+)/i },
  { key: "Perihal", regex: /perihal\s*:?\s*(.+)/i },
  { key: "Jabatan", regex: /jabatan\s*:?\s*(.+)/i },
  { key: "Instansi", regex: /instansi\s*:?\s*(.+)/i },
];

function parseOCRText(text) {
  const fields = [];
  OCR_PATTERNS.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      fields.push({ key, value: match[1].trim() });
    }
  });
  if (fields.length === 0) {
    const lines = text.split("\n").filter((l) => l.trim().length > 3);
    lines.slice(0, 10).forEach((line, i) => {
      fields.push({ key: `Teks ${i + 1}`, value: line.trim() });
    });
  }
  return fields;
}

export default function OcrScanner({ onApplyFields }) {
  const fileRef = useRef(null);
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrPreview, setOcrPreview] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrResults, setOcrResults] = useState([]);
  const [ocrDone, setOcrDone] = useState(false);

  const handleImageSelect = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) return;
    setOcrImage(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setOcrPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setOcrPreview(null);
    }
    setOcrResults([]);
    setOcrDone(false);
  };

  const runOCR = async () => {
    if (!ocrImage) return;
    setOcrLoading(true);
    setOcrStatus("Membaca dokumen...");
    setOcrProgress(0);
    try {
      const { data: { text } } = await Tesseract.recognize(ocrImage, "ind+eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const fields = parseOCRText(text);
      setOcrResults(fields);
      setOcrStatus("Selesai");
      setOcrDone(true);
    } catch {
      setOcrStatus("Gagal membaca dokumen");
    } finally {
      setOcrLoading(false);
    }
  };

  const resetOCR = () => {
    setOcrImage(null);
    setOcrPreview(null);
    setOcrResults([]);
    setOcrDone(false);
    setOcrStatus("");
    setOcrProgress(0);
  };

  const updateResult = (index, value) => {
    setOcrResults((prev) => prev.map((r, i) => (i === index ? { ...r, value } : r)));
  };

  return (
    <div className="bg-card border-2 border-dashed border-border rounded-xl p-5 space-y-4 hover:border-primary/40 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scan size={20} className="text-primary" />
        <h3 className="font-semibold text-foreground text-sm">Scan Otomatis (OCR)</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sakura-warning/20 text-sakura-warning">BETA</span>
      </div>
      <p className="text-[13px] text-muted-foreground">
        Unggah gambar dokumen untuk mengisi data otomatis menggunakan teknologi OCR.
      </p>

      {/* Image upload zone */}
      {!ocrImage ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-input rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload size={28} className="mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-foreground">Unggah foto/scan dokumen</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ocrPreview && (
            <img src={ocrPreview} alt="OCR Preview" className="w-full max-h-40 object-contain rounded-lg border border-border" />
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground truncate flex-1">{ocrImage.name}</span>
            <button type="button" onClick={resetOCR} className="text-xs text-destructive hover:underline">Hapus</button>
          </div>
        </div>
      )}
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])} />

      {/* Scan button */}
      {ocrImage && !ocrDone && (
        <button
          type="button"
          onClick={runOCR}
          disabled={ocrLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {ocrLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Sedang membaca dokumen...
            </>
          ) : (
            <><Scan size={16} /> Mulai Scan</>
          )}
        </button>
      )}

      {/* Progress bar */}
      {ocrLoading && (
        <div className="space-y-1">
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${ocrProgress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center">Membaca... {ocrProgress}%</p>
        </div>
      )}

      {/* Results */}
      {ocrDone && ocrResults.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          <h4 className="font-semibold text-sm text-foreground">Hasil Pembacaan OCR</h4>
          <div className="space-y-2">
            {ocrResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{r.key}</span>
                <input
                  value={r.value}
                  onChange={(e) => updateResult(i, e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => onApplyFields?.([r])}
                  className="p-1 rounded hover:bg-muted text-muted-foreground"
                  title="Salin ke Form"
                >
                  <Copy size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onApplyFields?.(ocrResults)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-sakura-success text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Check size={16} /> Terapkan Semua ke Form
          </button>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-sakura-warning/10 border border-sakura-warning/30">
            <AlertTriangle size={14} className="text-sakura-warning shrink-0 mt-0.5" />
            <p className="text-xs text-sakura-warning">Hasil OCR mungkin tidak 100% akurat. Harap periksa kembali sebelum menyimpan.</p>
          </div>
          <button type="button" onClick={resetOCR} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw size={12} /> Scan Ulang
          </button>
        </div>
      )}

      {/* Supported docs */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p className="font-medium">Dokumen yang didukung OCR:</p>
        {SUPPORTED_DOCS.map((d) => (
          <div key={d.label} className="flex items-center gap-1.5">
            <span className={d.full ? "text-sakura-success" : "text-sakura-warning"}>{d.full ? "✓" : "~"}</span>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
