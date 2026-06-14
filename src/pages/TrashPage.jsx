import { useApp } from "@/contexts/AppContext";
import { useEffect } from "react";
import AppHeader from "@/components/layout/AppHeader";
import {
  Trash2,
  RefreshCcw,
  AlertTriangle,
  FileText,
} from "lucide-react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function TrashPage() {
  const {
    trashedDocuments = [],
    restoreDocument,
    permanentlyDeleteDocument,
    loadTrashedDocuments,
  } = useApp();

  // Phase 4: load dokumen trash dari backend saat halaman dibuka
  useEffect(() => {
    loadTrashedDocuments();
  }, [loadTrashedDocuments]);

  return (
    <div className="flex flex-col h-full">
      <AppHeader
        title="Kotak Sampah"
        subtitle="Dokumen yang dihapus akan disimpan selama 30 hari sebelum dihapus permanen"
      />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
        {/* Warning */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-sakura-warning/10 border border-sakura-warning/20 text-sakura-warning">
          <AlertTriangle
            size={20}
            className="shrink-0"
          />

          <p className="text-sm font-medium">
            Dokumen di kotak sampah akan dihapus
            secara otomatis dan permanen setelah
            30 hari. Pastikan untuk memulihkan
            dokumen penting sebelum batas waktu
            habis.
          </p>
        </div>

        {/* Container */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Trash2
                size={18}
                className="text-muted-foreground"
              />

              Daftar Dokumen Dihapus (
              {trashedDocuments.length})
            </h3>
          </div>

          {/* Content */}
          <div className="divide-y divide-border">
            {trashedDocuments.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Trash2
                  size={48}
                  className="mb-4 opacity-20"
                />

                <p>Kotak sampah kosong.</p>

                <p className="text-xs mt-1">
                  Tidak ada dokumen yang dihapus
                  saat ini.
                </p>
              </div>
            ) : (
              trashedDocuments.map((doc) => {
                const deletedDate = doc.deletedAt || doc.deleted_at
                  ? new Date(doc.deletedAt || doc.deleted_at)
                  : new Date();

                return (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/10"
                  >
                    {/* Left */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText
                          size={20}
                          className="text-destructive"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {doc.judul}
                        </h4>

                        <div className="text-xs text-muted-foreground mt-0.5">
                          {doc.nomorDokumen} ·
                          Kategori: {doc.kategori}
                        </div>

                        <div className="text-xs font-medium text-destructive mt-1.5">
                          Dihapus pada:{" "}
                          {format(
                            deletedDate,
                            "dd MMM yyyy"
                          )}{" "}
                          (Sisa 30 hari)
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-sakura-success/10 hover:text-sakura-success hover:border-sakura-success/30"
                        onClick={() =>
                          restoreDocument &&
                          restoreDocument(doc.id)
                        }
                      >
                        <RefreshCcw
                          size={14}
                          className="mr-2"
                        />
                        Restore
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          permanentlyDeleteDocument &&
                          permanentlyDeleteDocument(
                            doc.id
                          )
                        }
                      >
                        <Trash2
                          size={14}
                          className="mr-2"
                        />
                        Hapus Permanen
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}