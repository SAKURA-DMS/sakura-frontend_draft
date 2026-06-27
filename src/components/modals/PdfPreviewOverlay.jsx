import { X, Download, Printer, ZoomIn, ZoomOut, Maximize, FileText } from "lucide-react";
import { useEffect, useState, useMemo } from "react";

function buildDocumentHtml(doc) {
  const siswa = doc.namaSiswa || "—";
  const nisn = doc.nisn || "—";
  const tahun = doc.tahunAjaran || "—";
  const kategori = doc.kategori || "Dokumen";
  const kelas = doc.kelas || "—";
  const nomor = doc.nomorDokumen || "—";
  const jenis = doc.jenisDokumen || kategori;

  const isNilai = kategori === "Nilai";
  const nilaiRows = isNilai
    ? `
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
        <thead>
          <tr style="background:#f0f4f8;">
            <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">No</th>
            <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">Mata Pelajaran</th>
            <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">Nilai</th>
            <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">Predikat</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ["1", "Bahasa Indonesia", "85", "B+"],
            ["2", "Matematika", "78", "B"],
            ["3", "IPA", "82", "B+"],
            ["4", "IPS", "88", "A-"],
            ["5", "Bahasa Inggris", "90", "A"],
            ["6", "Pendidikan Agama", "87", "A-"],
            ["7", "PPKN", "80", "B+"],
            ["8", "Seni Budaya", "84", "B+"],
          ]
            .map(
              ([no, mp, nilai, pred]) =>
                `<tr><td style="border:1px solid #cbd5e1;padding:6px 12px;">${no}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;">${mp}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;text-align:center;">${nilai}</td><td style="border:1px solid #cbd5e1;padding:6px 12px;text-align:center;">${pred}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Times New Roman', serif; color:#1e293b; padding:48px 56px; background:#fff; }
  .kop { text-align:center; border-bottom:3px double #1e293b; padding-bottom:16px; margin-bottom:24px; }
  .kop h1 { font-size:14px; letter-spacing:2px; text-transform:uppercase; color:#64748b; margin-bottom:2px; }
  .kop h2 { font-size:22px; font-weight:bold; }
  .kop h3 { font-size:13px; font-weight:normal; color:#64748b; }
  .kop p { font-size:11px; color:#94a3b8; margin-top:4px; }
  .meta { margin:20px 0; font-size:13px; }
  .meta td { padding:3px 12px 3px 0; vertical-align:top; }
  .meta td:first-child { font-weight:bold; width:160px; }
  .title-doc { text-align:center; font-size:16px; font-weight:bold; margin:28px 0 8px; text-decoration:underline; }
  .subtitle { text-align:center; font-size:13px; color:#64748b; margin-bottom:20px; }
  .content { font-size:13px; line-height:1.8; margin:16px 0; }
  .ttd { display:flex; justify-content:space-between; margin-top:48px; font-size:13px; }
  .ttd-box { text-align:center; width:200px; }
  .ttd-line { margin-top:64px; border-bottom:1px solid #1e293b; margin-bottom:4px; }
  .stamp { text-align:center; margin-top:12px; font-size:11px; color:#94a3b8; }
</style>
</head>
<body>
  <div class="kop">
    <h1>Dinas Pendidikan Kabupaten Bekasi</h1>
    <h2>SMP Negeri 4 Cikarang Barat</h2>
    <h3>Jl. Raya Cikarang-Cibarusah No. 45, Cikarang Barat, Bekasi 17530</h3>
    <p>Telp. (021) 8900-1234 | Email: info@smpn4cikarangbarat.sch.id</p>
  </div>

  <div class="title-doc">${jenis.toUpperCase()}</div>
  <div class="subtitle">Nomor: ${nomor}</div>

  <table class="meta">
    <tr><td>Jenis Dokumen</td><td>: ${jenis}</td></tr>
    <tr><td>Kategori</td><td>: ${kategori}</td></tr>
    <tr><td>Kelas / Unit</td><td>: ${kelas}</td></tr>
    ${siswa !== "—" ? `<tr><td>Nama Siswa</td><td>: ${siswa}</td></tr>` : ""}
    ${nisn !== "—" ? `<tr><td>NISN</td><td>: ${nisn}</td></tr>` : ""}
    <tr><td>Tahun Ajaran</td><td>: ${tahun}</td></tr>
    <tr><td>Status</td><td>: ${doc.status}</td></tr>
  </table>

  ${nilaiRows}

  <div class="content">
    ${
      isNilai
        ? `<p>Demikian laporan nilai ini dibuat berdasarkan hasil evaluasi yang telah dilaksanakan sesuai dengan kurikulum yang berlaku. Nilai di atas merupakan hasil asesmen formatif dan sumatif selama periode semester berjalan.</p>`
        : `<p>Dokumen ini diterbitkan oleh SMP Negeri 4 Cikarang Barat sebagai ${jenis.toLowerCase()} resmi yang sah dan dapat dipertanggungjawabkan. Segala informasi yang tercantum dalam dokumen ini telah diverifikasi dan sesuai dengan data administrasi sekolah.</p>`
    }
  </div>

  <div class="ttd">
    <div class="ttd-box">
      <div>Mengetahui,</div>
      <div>Kepala Sekolah</div>
      <div class="ttd-line"></div>
      <div><strong>Dr. Siti Rahayu, M.Pd.</strong></div>
      <div style="font-size:11px;color:#64748b;">NIP. 19780515 200501 2 003</div>
    </div>
    <div class="ttd-box">
      <div>Cikarang Barat,</div>
      <div>${new Date(doc.tanggalUpload).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
      <div class="ttd-line"></div>
      <div><strong>${doc.pengunggah.nama}</strong></div>
      <div style="font-size:11px;color:#64748b;">${doc.pengunggah.role}</div>
    </div>
  </div>

  <div class="stamp">Dokumen ini digenerate oleh sistem SAKURA — Secure Archiving and Keeping of Unified Records for Administration</div>
</body>
</html>`;
}

export default function PdfPreviewOverlay({ onClose, document: doc }) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  const htmlContent = useMemo(() => buildDocumentHtml(doc), [doc]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => { clearTimeout(t); window.removeEventListener("keydown", handler); };
  }, [onClose]);

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-foreground/90 flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-primary shrink-0" />
          <span className="font-semibold text-sm text-foreground truncate max-w-xs">{doc.judul}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium shrink-0">Preview Document</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="p-2 rounded hover:bg-muted"><ZoomOut size={18} /></button>
          <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(200, z + 25))} className="p-2 rounded hover:bg-muted"><ZoomIn size={18} /></button>
          <button onClick={() => setZoom(100)} className="p-2 rounded hover:bg-muted"><Maximize size={18} /></button>
          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={handlePrint} className="p-2 rounded hover:bg-muted" title="Download / Print">
            <Download size={18} />
          </button>
          <button className="p-2 rounded hover:bg-muted"><Printer size={18} /></button>
          <div className="w-px h-6 bg-border mx-1" />
          <button onClick={onClose} className="p-2 rounded hover:bg-destructive/10 text-destructive"><X size={20} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-8">
        {loading ? (
          <div className="flex flex-col items-center gap-3 mt-24">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-primary-foreground/70 text-sm">Memuat dokumen...</span>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-2xl transition-transform origin-top" style={{ transform: `scale(${zoom / 100})`, width: "794px", minHeight: "1123px" }}>
            <iframe srcDoc={htmlContent} title={`Preview ${doc.judul}`} className="w-full border-0 rounded-lg" style={{ width: "794px", minHeight: "1123px", height: "1123px" }} sandbox="allow-same-origin" />
          </div>
        )}
      </div>
    </div>
  );
}