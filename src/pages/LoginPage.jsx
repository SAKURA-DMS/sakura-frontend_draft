import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, FileCheck, Users, ScanLine } from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";
import SakuraPetals from "@/components/sakura/SakuraPetals";
import sakuraBg from "@/assets/sakura_branch.png"; 

/* ── Floating orbs on left panel ── */
function FloatingOrbs() {
  const orbs = useMemo(() => [
    { w: 320, h: 320, x: "80%", y: "-10%", delay: 0, dur: 18 },
    { w: 220, h: 220, x: "-8%", y: "75%", delay: 2, dur: 22 },
    { w: 160, h: 160, x: "60%", y: "60%", delay: 4, dur: 15 },
    { w: 100, h: 100, x: "30%", y: "20%", delay: 1, dur: 20 },
  ], []);

  return (
    <>
      {orbs.map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/[0.06]"
          style={{ width: o.w, height: o.h, left: o.x, top: o.y }}
        />
      ))}
    </>
  );
}

/* ── Animated feature cards on left panel ── */
const FEATURES = [
  { icon: FileCheck, title: "Arsip Digital", desc: "Simpan dokumen secara aman" },
  { icon: Shield, title: "Alur Persetujuan", desc: "Proses transparan dan akuntabel" },
  { icon: ScanLine, title: "Scan & Upload", desc: "Digitalisasi dokumen fisik" },
  { icon: Users, title: "Keamanan RBAC", desc: "Kontrol akses berbasis peran" },
];

function FeatureCards() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveIdx(p => (p + 1) % FEATURES.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-10 space-y-2">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        const isActive = i === activeIdx;
        return (
          <div
            key={f.title}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border cursor-default transition-all"
            style={{
              backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              borderColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
              transform: isActive ? "translateX(8px) scale(1.02)" : "translateX(0) scale(1)",
            }}
            onMouseEnter={() => setActiveIdx(i)}
          >
            <div style={{ transform: isActive ? "rotate(360deg) scale(1.2)" : "rotate(0) scale(1)" }}>
              <Icon size={16} className="text-white/80" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white font-semibold text-sm">{f.title}</span>
              {isActive && (
                <span className="text-white/60 text-sm inline-block overflow-hidden whitespace-nowrap">
                  {" · "}{f.desc}
                </span>
              )}
            </div>
            {isActive && (
              <div className="w-1.5 h-6 rounded-full bg-white/40" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Animated input field ── */
function AnimatedInput({ icon: Icon, label, type = "text", value, onChange, placeholder, suffix }) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <div style={{ transform: focused ? "scale(1.01)" : "scale(1)" }} className="transition-transform">
      <label
        className="block text-sm font-semibold mb-1.5 transition-colors"
        style={{ color: focused ? "hsl(347 55% 49%)" : "hsl(var(--foreground))" }}
      >
        {label}
      </label>
      <div className="relative group">
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-all"
          style={{
            transform: focused ? "scale(1.15)" : "scale(1)",
            color: focused ? "hsl(347 55% 49%)" : "hsl(var(--muted-foreground))",
          }}
        >
          <Icon size={18} />
        </div>
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-shadow"
          style={{
            boxShadow: focused
              ? "0 0 0 2px hsl(347 55% 49% / 0.25), 0 4px 16px -4px hsl(347 55% 49% / 0.15)"
              : "0 0 0 0px transparent",
          }}
        />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all"
        />
        {suffix}
        {/* Animated underline */}
        <div
          className="absolute bottom-0 left-1/2 h-[2px] rounded-full bg-primary transition-all"
          style={{
            width: focused ? "90%" : filled ? "60%" : "0%",
            transform: "translateX(-50%)",
            opacity: focused ? 1 : filled ? 0.4 : 0,
          }}
        />
      </div>
    </div>
  );
}

/* ── Typing animation for heading ── */
function TypedHeading() {
  const text = "Masuk ke Sistem";
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (chars < text.length) {
      const t = setTimeout(() => setChars(c => c + 1), 60);
      return () => clearTimeout(t);
    }
  }, [chars, text.length]);

  return (
    <h2 className="text-2xl font-bold text-foreground mb-1">
      {text.slice(0, chars)}
      <span className="inline-block w-[2px] h-6 bg-primary ml-0.5 align-middle" />
    </h2>
  );
}

/* ── Main login page ── */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const { login, users } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) { setError("Masukkan email terlebih dahulu."); return; }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const user = users.find((u) => u.email === email);
    setIsSubmitting(false);
    if (!user) { setError("Email tidak ditemukan."); return; }
    if (user.status === "menunggu_approval") {
      setError("Akun Anda belum diaktifkan. Silakan tunggu persetujuan dari Operator TU.");
      return;
    }
    if (user.twoFactorEnabled) {
      setPendingUser(user);
      setOtpStep(true);
      return;
    }
    const ok = login(email);
    if (ok === true) navigate("/dashboard");
  };

  const sendOtp = () => {
    setOtpSent(true);
    setOtpInfo(`Kode OTP telah dikirim ke ${pendingUser?.email}. Periksa email Anda.`);
    setTimeout(() => setOtpInfo(""), 4000);
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError("Masukkan 6 digit kode OTP yang dikirim ke email Anda.");
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email);
    setIsSubmitting(false);
    if (ok === true) navigate("/dashboard");
  };


  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 relative overflow-hidden">

        {/* 🌸 Base pink background */}
        <div
          className="absolute inset-0"
          style={{ background: "hsl(340 73% 65%)" }}
        />

        {/* 🌸 Sakura branch image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sakuraBg})`, opacity: 0.55 }}
        />

        {/* 🌸 Dark gradient overlay dari atas ke bawah agar teks putih terbaca */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, hsl(340 60% 30% / 0.45) 0%, hsl(340 55% 25% / 0.70) 60%, hsl(340 50% 20% / 0.85) 100%)",
          }}
        />

        {/* 🌸 Petals */}
        <SakuraPetals count={16} />

        <FloatingOrbs />

        <div className="relative px-12 py-16 z-10">
          <div className="flex items-center gap-3 mb-10">
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-white shadow-lg ring-2 ring-white/40 flex items-center justify-center hover:scale-110 hover:rotate-12 transition-transform">
                <img src={logoSakura} alt="SAKURA" className="w-10 h-10 rounded-lg" />
              </div>
              <div className="text-left">
                <div className="text-white font-bold text-xl tracking-wider drop-shadow">SAKURA</div>
                <div className="text-white/80 text-xs font-medium">Document Management System</div>
              </div>
            </button>

          </div>

          <h1 className="text-4xl font-extrabold text-white leading-[1.15] mb-4">
            Secure Archiving and<br />Keeping of Unified<br />Records for Administration
          </h1>

          <p className="text-white/80 text-base leading-relaxed max-w-lg">
            Sistem manajemen arsip digital untuk SMP Negeri 4 Cikarang Barat
          </p>

          <FeatureCards />

          <p className="mt-auto text-white/50 text-[11px] pt-8 font-medium">
            © 2026 SAKURA · Developed by Group 5
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 bg-background relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
            style={{ background: "radial-gradient(circle, hsl(347 55% 49%), transparent 70%)", right: "-100px", top: "-100px" }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
            style={{ background: "radial-gradient(circle, hsl(347 55% 49%), transparent 70%)", left: "-80px", bottom: "-80px" }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <button
            onClick={() => navigate("/")}
            className="lg:hidden flex items-center gap-3 mb-8"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-md ring-1 ring-primary/20 flex items-center justify-center">
              <img src={logoSakura} alt="SAKURA" className="w-10 h-10 rounded-lg" />
            </div>
            <span className="text-xl font-bold tracking-wider" style={{ color: "hsl(347 45% 38%)" }}>SAKURA</span>
          </button>


          {/* Kembali ke Home */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-medium hover:underline transition-colors"
              style={{ color: "hsl(347 45% 38%)" }}
            >
              <ArrowLeft size={15} />
              Kembali
            </button>
          </div>

          <div>
            <TypedHeading />
            <p className="text-muted-foreground text-sm mb-8">Autentikasi diperlukan untuk mengakses sistem</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <AnimatedInput
                icon={Mail}
                label="Email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="nama@sakura.sch.id"
              />
            </div>

            <div>
              <AnimatedInput
                icon={Lock}
                label="Kata Sandi"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    <div key={showPass ? "hide" : "show"}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-input accent-primary" /> Ingat saya
              </label>
              <button
                type="button"
                onClick={() => alert("Simulasi: Link reset password dikirim ke email")}
                className="text-sm font-semibold hover:underline" style={{ color: "hsl(347 45% 38%)" }}
              >
                Lupa password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium overflow-hidden">
                {error}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group w-full py-2.5 rounded-xl font-semibold transition-all hover:scale-102 active:scale-97 flex items-center justify-center gap-2 disabled:opacity-70 relative overflow-hidden text-white"
                style={{ background: "hsl(347 55% 42%)" }}
              >
                <div className="flex items-center gap-2 relative z-10">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Sistem
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          {otpStep && (
            <div className="mt-6 p-4 rounded-2xl border border-primary/30 bg-primary/[0.04] space-y-3">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">Verifikasi 2 Langkah</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Akun ini dilindungi verifikasi tambahan. Kirim kode OTP ke email Anda
                untuk melanjutkan masuk.
              </p>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "hsl(347 55% 42%)" }}
                >
                  Kirim OTP ke Email
                </button>
              ) : (
                <>
                  {otpInfo && (
                    <p className="text-xs text-sakura-success font-medium">{otpInfo}</p>
                  )}
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                    placeholder="6 digit kode OTP"
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm tracking-[0.4em] text-center focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="px-3 py-2 rounded-xl border border-input text-xs font-medium hover:bg-muted"
                    >
                      Kirim ulang
                    </button>
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                      style={{ background: "hsl(347 55% 42%)" }}
                    >
                      {isSubmitting ? "Memverifikasi..." : "Verifikasi & Masuk"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}



          <p className="text-center text-sm text-muted-foreground mt-5">
            Belum punya akun?{" "}
            <button onClick={() => navigate("/signup")} className="font-semibold hover:underline" style={{ color: "hsl(347 45% 38%)" }}>Daftar di sini</button>
          </p>


          <div>
            <p className="text-center text-[11px] text-muted-foreground/60 mt-6 font-medium">SMP Negeri 4 Cikarang Barat</p>
            <div className="border-t border-border/50 mt-5" />
            <p className="text-center text-[11px] text-muted-foreground/60 py-4 font-medium">© 2026 SAKURA · Developed by Group 5</p>
          </div>
        </div>
      </div>
    </div>
  );
}
