/**
 * uploadDraftService.js
 * Menyimpan dan memulihkan draft upload dokumen ke/dari localStorage.
 * File (binary) tidak bisa disimpan di localStorage — hanya metadata-nya.
 * Thumbnail disimpan sebagai base64 dataURL (maks ~5MB preview).
 */

const DRAFT_KEY = "sakura_upload_draft";

/** Simpan draft (semua state form, kecuali objek File asli) */
export function saveDraft(data) {
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      fillMode: data.fillMode,
      isUrgent: data.isUrgent,
      isSensitif: data.isSensitif,
      ownerNIPs: data.ownerNIPs,
      form: data.form
        ? {
            ...data.form,
            // Date tidak JSON-serializable: simpan sebagai ISO string
            tanggalUpload: data.form.tanggalUpload
              ? new Date(data.form.tanggalUpload).toISOString()
              : null,
          }
        : {},
      metaData: data.metaData ?? {},
      selectedCategoryId: data.selectedCategoryId ?? null,
      selectedTypeId: data.selectedTypeId ?? null,
      kategoriValue: data.kategoriValue ?? "",
      jenisValue: data.jenisValue ?? "",
      // Thumbnail: simpan dataURL (bisa null)
      filePreview: data.filePreview ?? null,
      // Nama & ukuran file untuk info (file asli tidak bisa disimpan)
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      fileType: data.fileType ?? null,
      // Scan pages (array of dataURL)
      scanPageImages: data.scanPageImages ?? [],
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    return true;
  } catch (e) {
    // QuotaExceededError (preview terlalu besar) – simpan tanpa preview
    try {
      const fallback = { ...data, filePreview: null, scanPageImages: [] };
      saveDraft(fallback);
    } catch {
      console.warn("[UploadDraft] Gagal menyimpan draft:", e);
    }
    return false;
  }
}

/** Baca draft. Kembalikan null jika tidak ada atau parsing gagal. */
export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Pulihkan Date dari string
    if (parsed.form?.tanggalUpload) {
      parsed.form.tanggalUpload = new Date(parsed.form.tanggalUpload);
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Hapus draft */
export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/** Apakah ada draft tersimpan? */
export function hasDraft() {
  return !!localStorage.getItem(DRAFT_KEY);
}