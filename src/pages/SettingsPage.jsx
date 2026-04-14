import { useState } from "react";
import { Sun, Moon, Monitor, Type, Globe, Bell, Eye, Camera, FolderTree, Shield, RotateCcw, ChevronRight } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const SECTIONS = [
  { id: "tema", label: "Tema", icon: Sun }, { id: "font", label: "Ukuran Teks", icon: Type }, { id: "bahasa", label: "Bahasa UI", icon: Globe },
  { id: "notif", label: "Notifikasi", icon: Bell }, { id: "viewer", label: "Preferensi Viewer", icon: Eye }, { id: "scan", label: "Scan & Upload", icon: Camera },
  { id: "folder", label: "Folder Mapping", icon: FolderTree }, { id: "security", label: "Privacy & Security", icon: Shield }, { id: "reset", label: "Reset Sistem", icon: RotateCcw },
];

export default function SettingsPage() {
  const { settings, updateSettings, updateNotifications, updateViewer, updateScan, updateFolderMapping, updateSecurity, resetToDefault } = useSettings();
  const { currentUser } = useApp();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState("tema");
  const isAdmin = currentUser.role === "Operator/TU";

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

  const renderSection = () => {
    switch (activeSection) {
      case "tema":
        return (<Card title="Tema" icon={Sun}><div className="grid grid-cols-3 gap-3">{[{ value: "light", label: "Terang", icon: Sun }, { value: "dark", label: "Gelap", icon: Moon }, { value: "system", label: "Ikuti Sistem", icon: Monitor }].map(({ value, label, icon: I }) => (<button key={value} onClick={() => updateSettings({ theme: value })} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.theme === value ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}><I size={24} className={settings.theme === value ? "text-primary" : "text-muted-foreground"} /><span className={`text-sm font-medium ${settings.theme === value ? "text-primary" : "text-foreground"}`}>{label}</span></button>))}</div><p className="text-xs text-muted-foreground mt-3">Perubahan tema akan diterapkan langsung pada seluruh antarmuka.</p></Card>);
      case "font":
        return (<Card title="Ukuran Teks" icon={Type}><div className="grid grid-cols-3 gap-3">{[{ value: "small", label: "Kecil", size: "text-xs" }, { value: "normal", label: "Normal", size: "text-sm" }, { value: "large", label: "Besar", size: "text-base" }].map(({ value, label, size }) => (<button key={value} onClick={() => updateSettings({ fontSize: value })} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${settings.fontSize === value ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}><span className={`font-semibold ${size} ${settings.fontSize === value ? "text-primary" : "text-foreground"}`}>Aa</span><span className={`text-sm font-medium ${settings.fontSize === value ? "text-primary" : "text-foreground"}`}>{label}</span></button>))}</div><div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border"><p className="text-foreground">Preview: Ini adalah contoh teks dengan ukuran yang dipilih.</p></div></Card>);
      case "bahasa":
        return (<Card title="Bahasa UI" icon={Globe}><div className="grid grid-cols-2 gap-3">{[{ value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" }, { value: "en", label: "English", flag: "🇬🇧" }].map(({ value, label, flag }) => (<button key={value} onClick={() => updateSettings({ language: value })} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${settings.language === value ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}><span className="text-2xl">{flag}</span><span className={`text-sm font-medium ${settings.language === value ? "text-primary" : "text-foreground"}`}>{label}</span></button>))}</div></Card>);
      case "notif":
        return (<Card title="Notifikasi" icon={Bell}><div className="space-y-1 divide-y divide-border"><Toggle label="Email" desc="Kirim notifikasi ke email" checked={settings.notifications.email} onChange={(v) => updateNotifications({ email: v })} /><Toggle label="In-App" desc="Tampilkan di panel notifikasi" checked={settings.notifications.inApp} onChange={(v) => updateNotifications({ inApp: v })} /><div className="pt-3 pb-1"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jenis Notifikasi</span></div><Toggle label="Upload dokumen" checked={settings.notifications.upload} onChange={(v) => updateNotifications({ upload: v })} /><Toggle label="Dokumen disetujui" checked={settings.notifications.approve} onChange={(v) => updateNotifications({ approve: v })} /><Toggle label="Dokumen ditolak" checked={settings.notifications.reject} onChange={(v) => updateNotifications({ reject: v })} /><Toggle label="Folder dibagikan" checked={settings.notifications.folderShare} onChange={(v) => updateNotifications({ folderShare: v })} /></div></Card>);
      case "viewer":
        return (<Card title="Preferensi Viewer" icon={Eye}><div className="space-y-1 divide-y divide-border"><Toggle label="Floating Preview" desc="Preview mengambang yang bisa fullscreen" checked={settings.viewer.floatingPreview} onChange={(v) => updateViewer({ floatingPreview: v })} /><Toggle label="Fullscreen saat klik" desc="Pratinjau langsung fullscreen saat diklik" checked={settings.viewer.fullscreenOnClick} onChange={(v) => updateViewer({ fullscreenOnClick: v })} /><div className="pt-3"><label className="block text-sm font-medium text-foreground mb-1">Default Zoom: {settings.viewer.defaultZoom}%</label><input type="range" min={50} max={200} step={10} value={settings.viewer.defaultZoom} onChange={(e) => updateViewer({ defaultZoom: Number(e.target.value) })} className="w-full accent-primary" /><div className="flex justify-between text-xs text-muted-foreground"><span>50%</span><span>200%</span></div></div></div></Card>);
      case "scan":
        return (<Card title="Scan & Upload Settings" icon={Camera}><div className="space-y-1 divide-y divide-border"><Toggle label="Auto-crop" desc="Otomatis potong area dokumen saat scan" checked={settings.scan.autoCrop} onChange={(v) => updateScan({ autoCrop: v })} /><div className="pt-3"><label className="block text-sm font-medium text-foreground mb-1">Compression Level</label><select value={settings.scan.compression} onChange={(e) => updateScan({ compression: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="low">Low (kualitas tinggi, ukuran besar)</option><option value="medium">Medium (seimbang)</option><option value="high">High (ukuran kecil, kualitas rendah)</option></select></div><div className="pt-3"><label className="block text-sm font-medium text-foreground mb-1">Auto-save Folder (opsional)</label><input value={settings.scan.autoSaveFolder} onChange={(e) => updateScan({ autoSaveFolder: e.target.value })} placeholder="Contoh: Scan/2024" className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" /></div></div></Card>);
      case "folder":
        return (<Card title="Default Folder Mapping" icon={FolderTree}><Toggle label="Auto-mapping" desc="Otomatis masukkan dokumen ke folder berdasarkan jenis" checked={settings.folderMapping.enabled} onChange={(v) => updateFolderMapping({ enabled: v })} /><div className="mt-4 border border-border rounded-lg overflow-hidden"><table className="w-full text-sm"><thead><tr className="bg-muted/50"><th className="text-left px-4 py-2 font-semibold text-foreground">Jenis Dokumen</th><th className="text-left px-4 py-2 font-semibold text-foreground">Folder Tujuan</th></tr></thead><tbody className="divide-y divide-border">{settings.folderMapping.mappings.map((m, i) => (<tr key={i}><td className="px-4 py-2 text-foreground">{m.jenisDokumen}</td><td className="px-4 py-2">{isAdmin ? (<input value={m.targetFolder} onChange={(e) => { const updated = [...settings.folderMapping.mappings]; updated[i] = { ...updated[i], targetFolder: e.target.value }; updateFolderMapping({ mappings: updated }); }} className="w-full px-2 py-1 rounded border border-input bg-background text-sm" />) : (<span className="text-muted-foreground">{m.targetFolder}</span>)}</td></tr>))}</tbody></table></div>{!isAdmin && <p className="text-xs text-muted-foreground mt-2">Hanya Admin yang dapat mengubah mapping folder.</p>}</Card>);
      case "security":
        return (<Card title="Privacy & Security" icon={Shield}><div className="space-y-1 divide-y divide-border"><Toggle label="Two-Factor Authentication" desc="Verifikasi tambahan saat login (simulasi)" checked={settings.security.twoFactor} onChange={(v) => { updateSecurity({ twoFactor: v }); toast({ title: v ? "2FA Diaktifkan (Simulasi)" : "2FA Dinonaktifkan", description: "Pada implementasi nyata, Anda akan diminta scan QR code." }); }} /><div className="pt-3"><label className="block text-sm font-medium text-foreground mb-1">Session Timeout</label><select value={settings.security.sessionTimeout} onChange={(e) => updateSecurity({ sessionTimeout: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"><option value="15m">15 menit</option><option value="1h">1 jam</option><option value="8h">8 jam</option></select></div><Toggle label="Login with Google" desc="Masuk menggunakan akun Google (simulasi)" checked={settings.security.loginWithGoogle} onChange={(v) => { updateSecurity({ loginWithGoogle: v }); toast({ title: v ? "Google Login Diaktifkan (Simulasi)" : "Google Login Dinonaktifkan" }); }} /></div></Card>);
      case "reset":
        return (<Card title="Reset Sistem" icon={RotateCcw}><div><p className="text-sm text-muted-foreground mb-4">Reset semua pengaturan ke nilai default. Tindakan ini tidak dapat dibatalkan.</p><button onClick={() => { resetToDefault(); toast({ title: "Pengaturan direset", description: "Semua preferensi dikembalikan ke default." }); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"><RotateCcw size={16} /> Reset ke Default</button></div></Card>);
      default: return null;
    }
  };

  return (
    <>
      <AppHeader title="Pengaturan Sistem" subtitle="Kelola preferensi dan konfigurasi akun Anda" />
      <div className="flex flex-col sm:flex-row flex-1 animate-fade-in overflow-hidden">
        <div className="w-full sm:w-64 shrink-0 border-b sm:border-b-0 sm:border-r border-border bg-card p-4 space-y-1 overflow-x-auto sm:overflow-y-auto">
          <div className="flex sm:flex-col gap-1">{SECTIONS.map(({ id, label, icon: Icon }) => (<button key={id} onClick={() => setActiveSection(id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSection === id ? "bg-secondary text-primary" : "text-foreground hover:bg-muted"}`}><Icon size={16} className={activeSection === id ? "text-primary" : "text-muted-foreground"} /><span className="flex-1 text-left">{label}</span>{activeSection === id && <ChevronRight size={14} className="text-primary hidden sm:block" />}</button>))}</div>
        </div>
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto"><div className="max-w-2xl">{renderSection()}</div></div>
      </div>
    </>
  );
}
