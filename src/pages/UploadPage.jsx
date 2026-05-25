import { useState } from "react";
import Header from "@/components/layout/Header";
import UploadForm from "@/components/document/UploadForm";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { Info, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPES } from "@/data/mockData";

export default function UploadPage() {
  const { currentUser } = useApp();
  const role = currentUser.role;
  const isOperator = role === "Operator/TU";
  const isGuru = role === "Guru";

  // Modules removed: show upload form directly to users who can upload.
  const guruUploadOwn = isGuru; // allow teacher uploads but additional restrictions handled later

  return (
    <>
      <Header title="Upload Dokumen" subtitle="Unggah dokumen untuk diproses dan diarsipkan" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 lg:p-8 space-y-6">
        {!isOperator && !isGuru && (
          <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-primary/[0.06] border-l-4 border-primary">
            <Info size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-primary font-medium">Hanya Operator TU yang dapat mengunggah dokumen ke sistem SAKURA</p>
          </div>
        )}

        {/* Module selector removed — modules simplified. */}
        {(isOperator || isGuru) ? (
          <UploadForm
            selectedModule={null}
            guruUploadOwn={guruUploadOwn}
            lockedNip={guruUploadOwn ? currentUser.nip : null}
            lockedTypeId={null}
          />
        ) : null}
      </motion.div>
    </>
  );
}
