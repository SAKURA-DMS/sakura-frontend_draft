import AppHeader from "@/components/layout/AppHeader";
import UploadForm from "@/components/upload/UploadForm";
import { useApp } from "@/contexts/AppContext";
import { Info } from "lucide-react";

export default function UploadPage() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Memuat halaman upload...
      </div>
    );
  }

  const role = currentUser.role;
  const isOperator = role === "Operator/TU";
  const isGuru = role === "Guru";

  return (
    <div className="flex flex-col h-full bg-background">
      <AppHeader title="Upload Dokumen" subtitle="Unggah dokumen untuk diproses dan diarsipkan" />

      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {!isOperator && !isGuru && (
          <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-primary/[0.06] border-l-4 border-primary mb-6">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary font-medium">
              Hanya Operator TU dan Guru yang diizinkan untuk mengunggah dokumen ke sistem SAKURA.
            </p>
          </div>
        )}

        {(isOperator || isGuru) && (
          <UploadForm
            selectedModule={null}
            guruUploadOwn={isGuru}
            lockedNip={isGuru ? currentUser.nip : null}
            lockedTypeId={null}
          />
        )}
      </div>
    </div>
  );
}