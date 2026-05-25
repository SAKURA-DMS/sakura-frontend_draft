import { useState } from "react";
import { Sun, Moon, Monitor, Bell, Camera, Shield, ChevronRight, Mail, Lock, CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { id: "tema", label: "Tema", icon: Sun },
  { id: "notif", label: "Notifikasi", icon: Bell },
  { id: "scan", label: "Scan & Upload", icon: Camera },
  { id: "security", label: "Privacy & Security", icon: Shield },
];

export default function SettingsPage() {
  const { settings, updateSettings, updateNotifications, updateScan, updateSecurity } = useSettings();
  const { currentUser, setTwoFactorEnabled } = useApp();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("tema");

  // 2FA local flow state
  const enabled = !!currentUser.twoFactorEnabled;
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);

  const Card = ({ children, title, icon: Icon }) => (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Icon size={18} className="text-primary" /> {title}</h3>
      {children}
    </div>
  );

  const Toggle = ({ label, checked, onChange, desc }) => (
    <div className="flex items-center justify-between py-2">
      <div><div className="text-sm font-medium text-foreground">{label}</div>{desc && <div className="text-xs text-muted-foreground">{desc}</div>}</div>
      <button onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-input"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  const handleToggle2FA = (v) => {
    // When enabling, start verification flow first. Only finalize after OTP verification.
    if (v) {
      setEnabling2FA(true);
      setOtpSent(false);
      setOtp("");
      setVerified(false);
    } else {
      // disable immediately
      setTwoFactorEnabled(false);
      updateSecurity({ twoFactor: false });
      setOtpSent(false);
      setOtp("");
      setVerified(false);
      setEnabling2FA(false);
      toast({ title: "2FA dinonaktifkan", description: "2FA telah dimatikan." });
    }
  };

  const handleSendOtp = () => {
    // Simulate backend send
    setOtpSent(true);
    toast({ title: "Kode OTP dikirim", description: `Kode telah dikirim ke ${currentUser.email}.` });
  };

  const handleVerify = () => {
    if (!/^\d{6}$/.test(otp)) {
      toast({ title: "Kode tidak valid", description: "Masukkan 6 digit kode OTP.", variant: "destructive" });
      return;
    }
    // finalize enabling flow
    setVerified(true);
    setTwoFactorEnabled(true);
    updateSecurity({ twoFactor: true });
    setEnabling2FA(false);
    toast({ title: "Verifikasi berhasil", description: "Email OTP telah diaktifkan sebagai metode 2FA." });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "tema":
        return (
          <Card title="Tema" icon={Sun}>
            <div className="grid grid-cols-3 gap-3">
              {[{ value: "light", label: "Terang", icon: Sun }, { value: "dark", label: "Gelap", icon: Moon }, { value: "system", label: "Ikuti Sistem", icon: Monitor }].map(({ value, label, icon: I }) => (
                <button key={value} onClick={() => updateSettings({ theme: value })} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === value ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}>
                  <I size={24} className={settings.theme === value ? "text-primary" : "text-muted-foreground"} />
                  <span className={`text-sm font-medium ${settings.theme === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                </button>
              ))}
            </div>
          </Card>
        );
      case "notif":
        return (
          <Card title="Notifikasi" icon={Bell}>
            <div className="space-y-1 divide-y divide-border">
              <Toggle label="Email" desc="Kirim notifikasi ke email" checked={settings.notifications.email} onChange={(v) => updateNotifications({ email: v })} />
              <Toggle label="In-App" desc="Tampilkan di panel notifikasi" checked={settings.notifications.inApp} onChange={(v) => updateNotifications({ inApp: v })} />
              <Toggle label="Upload dokumen" checked={settings.notifications.upload} onChange={(v) => updateNotifications({ upload: v })} />
              <Toggle label="Dokumen disetujui" checked={settings.notifications.approve} onChange={(v) => updateNotifications({ approve: v })} />
              <Toggle label="Dokumen ditolak" checked={settings.notifications.reject} onChange={(v) => updateNotifications({ reject: v })} />
            </div>
          </Card>
        );
      case "scan":
        return (
          <Card title="Scan & Upload" icon={Camera}>
            <div className="space-y-1 divide-y divide-border">
              <Toggle label="Auto-crop" desc="Otomatis potong area dokumen saat scan" checked={settings.scan.autoCrop} onChange={(v) => updateScan({ autoCrop: v })} />
              <div className="pt-3">
                <label className="block text-sm font-medium text-foreground mb-1">Compression Level</label>
                <select value={settings.scan.compression} onChange={(e) => updateScan({ compression: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  <option value="low">Low (kualitas tinggi)</option>
                  <option value="medium">Medium (seimbang)</option>
                  <option value="high">High (ukuran kecil)</option>
                </select>
              </div>
            </div>
          </Card>
        );
      case "security":
        return (
          <Card title="Privacy & Security" icon={Shield}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border bg-muted/30">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-foreground">Two-Factor Authentication (2FA)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Lindungi akun Anda dengan verifikasi tambahan saat login.</div>
                </div>
                <button onClick={() => handleToggle2FA(!enabled)} className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${enabled ? "bg-primary" : "bg-input"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : ""}`} />
                </button>
              </div>

              {/* Before enabling: don't show methods. After user toggles 'on' (enabling2FA) or when already enabled, show Email OTP method */}
              {(!enabled && !enabling2FA) ? null : (
                <>
                  <p className="text-xs text-muted-foreground px-1">Pilih metode verifikasi 2FA. Saat ini hanya tersedia Email OTP.</p>

                  {/* Email OTP — active method (shown during enabling or when already enabled) */}
                  <div className="p-4 rounded-xl border-2 border-primary bg-primary/[0.04] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Mail size={18} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">Menggunakan Email (OTP)</div>
                        <div className="text-xs text-muted-foreground">Kode verifikasi dikirim ke email Anda setiap kali login.</div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{enabled ? "Aktif" : enabling2FA ? "Verifikasi" : ""}</span>
                    </div>

                    {/* Step-by-step tutorial */}
                    <ol className="text-xs text-muted-foreground space-y-1.5 pl-4 list-decimal">
                      <li>Klik tombol di bawah untuk mengirim kode OTP ke email Anda.</li>
                      <li>Buka inbox email <span className="font-medium text-foreground">{currentUser.email}</span> dan salin kode 6 digit.</li>
                      <li>Masukkan kode pada kolom verifikasi, lalu klik "Verifikasi".</li>
                      <li>Setelah verifikasi, 2FA akan aktif dan akan diminta saat login selanjutnya.</li>
                    </ol>

                    {!otpSent ? (
                      <button onClick={handleSendOtp} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2">
                        <Mail size={16} /> Kirim OTP ke Email
                      </button>
                    ) : verified ? (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-sakura-success/10 border border-sakura-success/30 text-sakura-success text-sm">
                        <CheckCircle2 size={18} /> Email OTP berhasil diverifikasi dan 2FA diaktifkan.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          inputMode="numeric"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="6 digit kode OTP"
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-center tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSendOtp} className="px-3 py-2 rounded-lg border border-input text-xs hover:bg-muted">Kirim ulang</button>
                          <button onClick={handleVerify} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Verifikasi</button>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEnabling2FA(false); setOtpSent(false); setOtp(""); }} className="flex-1 py-2 rounded-lg border border-input text-sm">Batal</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <AppHeader title="Pengaturan Sistem" subtitle="Kelola preferensi dan keamanan akun Anda" />
      <div className="flex flex-col sm:flex-row flex-1 animate-fade-in overflow-hidden">
        <div className="w-full sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-card p-4 space-y-1 overflow-x-auto sm:overflow-y-auto">
          <div className="flex sm:flex-col gap-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === id ? "bg-secondary text-primary" : "text-foreground hover:bg-muted"}`}>
                <Icon size={16} className={activeSection === id ? "text-primary" : "text-muted-foreground"} />
                <span className="flex-1 text-left">{label}</span>
                {activeSection === id && <ChevronRight size={14} className="text-primary hidden sm:block" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto"><div className="max-w-2xl">{renderSection()}</div></div>
      </div>
    </>
  );
}
