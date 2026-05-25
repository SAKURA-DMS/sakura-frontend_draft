import { useState } from "react";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export default function ChangePasswordPage() {
  const { changePassword } = useApp();
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!currentPw) e.currentPw = "Password saat ini wajib diisi";
    if (!newPw) e.newPw = "Password baru wajib diisi";
    else if (newPw.length < 6) e.newPw = "Password minimal 6 karakter";
    if (newPw !== confirmPw) e.confirmPw = "Konfirmasi password tidak cocok";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      const result = changePassword(currentPw, newPw);
      if (!result) {
        setErrors({ currentPw: "Password saat ini tidak sesuai" });
        setSaving(false);
        return;
      }
      toast({ title: "Password berhasil diubah" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setErrors({});
      setSaving(false);
    }, 400);
  };

  const pwField = (label, value, setter, show, toggleShow, errorKey) => (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => { setter(e.target.value); setErrors((p) => ({ ...p, [errorKey]: undefined })); }}
          className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          placeholder={label}
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[errorKey] && <p className="text-xs text-destructive mt-1">{errors[errorKey]}</p>}
    </div>
  );

  return (
    <>
      <AppHeader title="Ubah Password" subtitle="Perbarui password akun Anda" />
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto animate-fade-in">
        <div className="max-w-xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <KeyRound size={18} className="text-primary" /> Ubah Password
            </h3>

            {pwField("Password Saat Ini", currentPw, setCurrentPw, showCurrent, () => setShowCurrent(!showCurrent), "currentPw")}
            {pwField("Password Baru", newPw, setNewPw, showNew, () => setShowNew(!showNew), "newPw")}
            {pwField("Konfirmasi Password Baru", confirmPw, setConfirmPw, showConfirm, () => setShowConfirm(!showConfirm), "confirmPw")}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Menyimpan..." : "Simpan Password"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
