/**
 * ocrService.js
 * OCR menggunakan Tesseract.js — library paling stabil untuk OCR di browser.
 * Load via dynamic import agar tidak mempengaruhi bundle size.
 *
 * Tesseract.js v5 (latest stable): https://github.com/naptha/tesseract.js
 * CDN: https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js
 *
 * Cara kerja:
 * 1. Worker di-inisialisasi sekali (singleton).
 * 2. Recognize dari dataUrl atau File.
 * 3. Kembalikan teks mentah + confidence.
 */

let worker = null;
let workerLoading = false;
let workerReady = false;

/**
 * Muat Tesseract.js secara dinamis (lazy load).
 * Menggunakan versi CDN agar tidak perlu install npm package.
 */
async function loadTesseract() {
  if (window.Tesseract) return window.Tesseract;

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.onload = () => resolve(window.Tesseract);
    script.onerror = () => reject(new Error("Gagal memuat Tesseract.js"));
    document.head.appendChild(script);
  });
}

/**
 * Inisialisasi worker (satu kali).
 * @param {function} onProgress - callback progress (0–1)
 */
export async function initOCR(onProgress) {
  if (workerReady) return worker;
  if (workerLoading) {
    // Tunggu sampai selesai
    while (workerLoading) await new Promise((r) => setTimeout(r, 100));
    return worker;
  }

  workerLoading = true;
  try {
    const Tesseract = await loadTesseract();

    worker = await Tesseract.createWorker("ind+eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress) {
          onProgress(m.progress);
        }
      },
      // WASM path — Tesseract.js akan fetch dari CDN secara otomatis
    });

    workerReady = true;
  } catch (err) {
    workerLoading = false;
    throw err;
  }
  workerLoading = false;
  return worker;
}

/**
 * Jalankan OCR pada gambar.
 * @param {string|File|Blob} image - bisa berupa dataUrl, File, atau Blob
 * @param {function} onProgress - callback (0–1)
 * @returns {Promise<{text: string, confidence: number, words: Array}>}
 */
export async function recognizeImage(image, onProgress) {
  const w = await initOCR(onProgress);
  const result = await w.recognize(image);
  return {
    text: result.data.text || "",
    confidence: result.data.confidence || 0,
    words: result.data.words || [],
    lines: result.data.lines || [],
  };
}

/**
 * Terminate worker (opsional, panggil saat komponen di-unmount).
 */
export async function terminateOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
    workerReady = false;
  }
}

/**
 * Parse teks OCR dan ekstrak field-field umum dokumen sekolah.
 * Ini adalah heuristic parser — confidence bervariasi tergantung kualitas scan.
 *
 * @param {string} rawText - hasil OCR
 * @returns {object} field yang terdeteksi
 */
export function parseDocumentFields(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const lines = rawText.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const fields = {};

  // Helper: cari nilai setelah label (case-insensitive, spasi fleksibel)
  const extract = (pattern) => {
    const m = text.match(pattern);
    return m ? m[1].trim() : "";
  };

  // ── Nama siswa ──
  fields.namaSiswa =
    extract(/nama\s*(?:siswa|lengkap|:)[\s:]*([A-Za-z\s]+?)(?:\n|NIS|NISN|TTL|$)/i) ||
    extract(/nama[\s:]+([A-Za-z\s]{3,40})/i);

  // ── NIS / NISN ──
  fields.nis = extract(/NIS[\s:]+(\d{4,12})/i);
  fields.nisn = extract(/NISN[\s:]+(\d{6,12})/i);

  // ── Kelas ──
  fields.kelas = extract(/kelas[\s:]+([0-9A-Za-z\s/-]{1,15})/i);

  // ── Tahun ajaran ──
  fields.tahunAjaran = extract(/tahun\s*ajaran[\s:]+(\d{4}[/\-]\d{4})/i);

  // ── Tanggal / Tempat lahir ──
  fields.tempatLahir = extract(/tempat\s*(?:lahir|ttl)[\s:,]+([A-Za-z\s]{3,30})/i);
  fields.tanggalLahir = extract(/(?:tanggal\s*lahir|tgl\.?\s*lahir)[\s:]+(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})/i) ||
    extract(/ttl[\s:]+[A-Za-z\s,]+,\s*(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})/i);

  // ── Jenis kelamin ──
  if (/\b(laki-laki|laki laki|L\b)/i.test(text)) fields.jenisKelamin = "Laki-Laki";
  else if (/\b(perempuan|P\b)/i.test(text)) fields.jenisKelamin = "Perempuan";

  // ── Nama orang tua ──
  fields.namaOrangTua =
    extract(/(?:nama\s*)?orang\s*tua[\s:]+([A-Za-z\s]{3,40})/i) ||
    extract(/(?:nama\s*)?ayah[\s:]+([A-Za-z\s]{3,40})/i);

  // ── Nomor HP ──
  fields.noHpOrangTua = extract(/(?:no\.?\s*hp|telepon|hp)[\s:]+(\+?[\d\s-]{9,15})/i);

  // ── NIP guru ──
  fields.nip = extract(/NIP[\s:]+(\d{10,20})/i);

  // ── Nomor surat ──
  fields.nomorSurat = extract(/(?:nomor\s*surat|no\.?\s*surat)[\s:]+([A-Za-z0-9/\-.]{4,30})/i);

  // ── Perihal ──
  fields.perihal = extract(/(?:perihal|hal)[\s:]+([^\n]{3,80})/i);

  // ── Tanggal surat ──
  fields.tanggalSurat = extract(/(?:tanggal|tgl\.?)[\s:]+(\d{1,2}\s+\w+\s+\d{4})/i);

  // ── Pengirim / Asal surat ──
  fields.pengirim = extract(/(?:dari|pengirim|asal)[\s:]+([^\n]{3,60})/i);

  // ── Tujuan surat ──
  fields.tujuan = extract(/(?:kepada|tujuan|yth)[\s.,:]+([^\n]{3,60})/i);

  // ── Nama barang (inventaris) ──
  fields.namaBarang = extract(/(?:nama\s*barang|barang)[\s:]+([^\n]{3,60})/i);

  // ── Judul dokumen — ambil baris ke-1 atau ke-2 yang cukup panjang ──
  for (const line of lines.slice(0, 5)) {
    if (line.length > 8 && line.length < 120 && !fields.judul) {
      fields.judul = line.replace(/[^A-Za-z0-9\s\-().,]/g, "").trim();
    }
  }

  // Bersihkan nilai kosong
  Object.keys(fields).forEach((k) => {
    if (!fields[k]) delete fields[k];
  });

  return fields;
}