import { useState } from "react";
import Header from "@/components/layout/Header";
import UploadForm from "@/components/document/UploadForm";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { Info, AlertCircle } from "lucide-react";
import { MODULE_DEFINITIONS, DOCUMENT_TYPES } from "@/data/mockData";

export default function UploadPage() {
  const { currentUser } = useApp();
  const role = currentUser.role;
  const isOperator = role === "Operator/TU";
  const isGuru = role === "Guru";

  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubType, setSelectedSubType] = useState(null);

  // Determine if user can upload in the selected module
  const canUpload = () => {
    if (!selectedModule) return false;
    if (isOperator) return true;
    if (isGuru) {
      if (selectedModule.id === "kepegawaian" && selectedSubType) {
        const sub = selectedModule.subPermissions?.[selectedSubType];
        return sub?.guruCanUploadOwn === true;
      }
      return false;
    }
    return false;
  };

  const guruUploadOwn = isGuru && selectedModule?.id === "kepegawaian" && canUpload();

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

        {/* Module selector */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h3 className="font-bold text-foreground mb-4">Pilih Modul Dokumen</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MODULE_DEFINITIONS.map((mod) => {
              const isSelected = selectedModule?.id === mod.id;
              const allowed = isOperator || (isGuru && mod.id === "kepegawaian");
              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod);
                    setSelectedSubType(null);
                  }}
                  disabled={!allowed}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected ? "border-primary bg-primary/[0.06]" : allowed ? "border-border hover:border-primary/40" : "border-border opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>{mod.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{mod.type_ids.length} jenis dokumen</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-type selector for Kepegawaian when Guru */}
        {isGuru && selectedModule?.id === "kepegawaian" && (
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <h3 className="font-bold text-foreground mb-4">Pilih Jenis Dokumen</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {selectedModule.type_ids.map((typeId) => {
                const dt = DOCUMENT_TYPES.find((t) => t.type_id === typeId);
                const canSelect = selectedModule.subPermissions?.[typeId]?.guruCanUploadOwn;
                const isSelected = selectedSubType === typeId;
                return (
                  <button
                    key={typeId}
                    onClick={() => setSelectedSubType(typeId)}
                    disabled={!canSelect}
                    className={`p-3 rounded-lg border text-left transition-all text-sm ${
                      isSelected ? "border-primary bg-primary/[0.06] text-primary font-medium" : canSelect ? "border-border hover:border-primary/40" : "border-border opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {dt?.type_name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error banner for Guru selecting non-allowed module */}
        {isGuru && selectedModule && !canUpload() && (
          <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-destructive/10 border-l-4 border-destructive">
            <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive font-medium">Anda tidak memiliki izin untuk mengunggah dokumen pada modul ini.</p>
          </div>
        )}

        {/* Show form when allowed */}
        {(isOperator && selectedModule) || (isGuru && canUpload()) ? (
          <UploadForm
            selectedModule={selectedModule}
            guruUploadOwn={guruUploadOwn}
            lockedNip={guruUploadOwn ? currentUser.nip : null}
            lockedTypeId={isGuru ? selectedSubType : null}
          />
        ) : null}
      </motion.div>
    </>
  );
}
