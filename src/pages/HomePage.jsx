import { useNavigate } from "react-router-dom";
import { Shield, FileText, CheckCircle, Smartphone, Archive, Users } from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";
import herSchool from "@/assets/hero_school.jpg";

const STATS = [
  { label: "Total Ijazah", value: "4,789" },
  { label: "Dokumen Terarsip", value: "1,245" },
  { label: "Pengguna Aktif", value: "36" },
];

// Fitur-fitur aplikasi
const FEATURES = [
  { icon: FileText, title: "Arsip Digital", desc: "Simpan dan kelola ijazah, rapor, dan dokumen akademik dalam format digital yang aman dan terstruktur." },
  { icon: CheckCircle, title: "Alur Persetujuan", desc: "Proses persetujuan dokumen yang transparan dengan audit trail lengkap dan notifikasi real-time." },
  { icon: Smartphone, title: "Scan Mobile", desc: "Scan dokumen langsung dari perangkat mobile menggunakan kamera untuk kemudahan digitalisasi." },
  { icon: Shield, title: "Keamanan Data", desc: "Sistem keamanan berbasis Role-Based Access Control (RBAC) untuk melindungi data sensitif sekolah." },
  { icon: Archive, title: "Pengarsipan Terstruktur", desc: "Struktur folder berdasarkan tahun, kelas, dan jenis dokumen untuk pencarian yang mudah." },
  { icon: Users, title: "Multi-Role", desc: "Dukungan akses untuk Operator/TU, Kepala Sekolah, dan Guru." },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={logoSakura} alt="SAKURA" className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-bold text-primary text-lg leading-tight">SAKURA</div>
              <div className="text-muted-foreground text-xs">Secure Archive System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="px-5 py-2 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors text-foreground">Login</button>
            <button onClick={() => navigate("/signup")} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Sign Up</button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={herSchool} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary-foreground leading-tight mb-6">Sistem Arsip Digital<br />SMP Negeri 4<br />Cikarang Barat</h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">SAKURA (Secure Archiving and Keeping of Unified Records for Administration) adalah sistem manajemen arsip digital yang dirancang khusus untuk pengelolaan ijazah dan dokumen akademik secara aman, terstruktur, dan efisien.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary-foreground text-primary font-bold hover:opacity-90 transition-opacity">Masuk ke Sistem</button>
              <button onClick={() => navigate("/signup")} className="px-8 py-3 rounded-lg border-2 border-primary-foreground/30 text-primary-foreground font-semibold hover:bg-primary-foreground/10 transition-colors">Daftar Akun</button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Tentang SMP Negeri 4 Cikarang Barat</h2>
          <p className="max-w-3xl mx-auto text-muted-foreground leading-relaxed">SMP Negeri 4 Cikarang Barat merupakan salah satu institusi pendidikan menengah pertama yang berkomitmen pada digitalisasi administrasi sekolah. Dengan visi menjadi sekolah yang unggul dalam pengelolaan arsip digital, SAKURA hadir sebagai solusi modern untuk manajemen dokumen akademik yang selama ini dilakukan secara manual. Sistem ini mendukung transparansi, efisiensi, dan keamanan dalam pengelolaan ijazah, rapor, surat keputusan, dan dokumen administrasi lainnya.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground text-center mb-3">Fitur Unggulan SAKURA</h2>
          <p className="text-center text-muted-foreground mb-12">Solusi lengkap untuk pengelolaan arsip sekolah</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4"><Icon size={24} className="text-primary" /></div>
                <h3 className="font-bold text-foreground text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Siap Memulai?</h2>
          <p className="text-primary-foreground/70 mb-8">Masuk ke sistem SAKURA untuk mengelola arsip dokumen sekolah Anda.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 rounded-lg bg-primary-foreground text-primary font-bold hover:opacity-90 transition-opacity">Masuk Sekarang →</button>
        </div>
      </section>

      <footer className="py-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">© 2026 SAKURA · SMP Negeri 4 Cikarang Barat · President University Capstone Project</div>
      </footer>
    </div>
  );
}