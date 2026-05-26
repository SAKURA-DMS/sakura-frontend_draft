import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl ring-1 ring-primary/20 flex items-center justify-center mx-auto mb-6">
          <img src={logoSakura} alt="SAKURA" className="w-16 h-16 rounded-xl" />
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-2 text-destructive">
          <AlertTriangle size={24} />
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Maaf, halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau terjadi kesalahan pada server.
        </p>
        
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={18} />
          Kembali ke Halaman Sebelumnya
        </button>
      </div>
    </div>
  );
}