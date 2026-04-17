import { X, User as UserIcon, Mail, Shield, Building, Lock, Camera, Upload } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useRef, useState, useCallback, useEffect } from "react";

export default function UserProfileModal({ user, onClose }) {
  const { updateUserAvatar, logout, currentUser } = useApp();
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const isOwnProfile = currentUser.id === user.id;

  const handleFileUpload = (e) => { const file = e.target.files?.[0]; if (!file || !isOwnProfile) return; const reader = new FileReader(); reader.onload = () => updateUserAvatar(user.id, reader.result); reader.readAsDataURL(file); };
  const startCamera = useCallback(async () => { if (!isOwnProfile) return; try { const s = await navigator.mediaDevices.getUserMedia({ video: true }); setStream(s); setShowCamera(true); } catch { alert("Kamera tidak tersedia"); } }, [isOwnProfile]);
  useEffect(() => { if (showCamera && stream && videoRef.current) videoRef.current.srcObject = stream; return () => { stream?.getTracks().forEach((t) => t.stop()); }; }, [showCamera, stream]);
  const capturePhoto = () => { if (!videoRef.current || !canvasRef.current || !isOwnProfile) return; const ctx = canvasRef.current.getContext("2d"); canvasRef.current.width = videoRef.current.videoWidth; canvasRef.current.height = videoRef.current.videoHeight; ctx?.drawImage(videoRef.current, 0, 0); const dataUrl = canvasRef.current.toDataURL("image/jpeg"); updateUserAvatar(user.id, dataUrl); stream?.getTracks().forEach((t) => t.stop()); setShowCamera(false); setStream(null); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border"><h2 className="font-bold text-foreground">Profil Pengguna</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-muted"><X size={20} /></button></div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4"><div className="relative"><img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" /></div><div><div className="font-bold text-foreground">{user.nama}</div><span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">{user.role}</span></div></div>
          {isOwnProfile && !showCamera && (<div className="flex gap-2"><button onClick={() => fileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-input text-sm hover:bg-muted transition-colors"><Upload size={16} /> Upload Foto</button><button onClick={startCamera} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-input text-sm hover:bg-muted transition-colors"><Camera size={16} /> Ambil Foto</button><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} /></div>)}
          {!isOwnProfile && <p className="text-xs text-muted-foreground italic">Anda hanya dapat mengubah foto profil Anda sendiri.</p>}
          {showCamera && (<div className="space-y-2"><video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-foreground/5" /><canvas ref={canvasRef} className="hidden" /><div className="flex gap-2"><button onClick={capturePhoto} className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Ambil Foto</button><button onClick={() => { stream?.getTracks().forEach((t) => t.stop()); setShowCamera(false); setStream(null); }} className="px-3 py-2 rounded-lg border border-input text-sm">Batal</button></div></div>)}
          <div className="h-px bg-border" />
          <div className="space-y-4">{[{ icon: UserIcon, label: "Nama Lengkap", value: user.nama }, { icon: Mail, label: "Email", value: user.email }, { icon: Shield, label: "Role", value: user.role }, { icon: Building, label: "Departemen", value: user.departemen }].map(({ icon: Icon, label, value }) => (<div key={label} className="flex items-center gap-3"><Icon size={18} className="text-muted-foreground shrink-0" /><div><div className="text-xs text-muted-foreground">{label}</div><div className="text-sm font-medium text-foreground">{value}</div></div></div>))}</div>
          <div className="h-px bg-border" />
          {isOwnProfile && (<>{!showPassword ? (<button onClick={() => setShowPassword(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-input text-sm hover:bg-muted transition-colors"><Lock size={16} /> Ubah Password</button>) : (<div className="space-y-3"><input type="password" placeholder="Password Lama" className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" /><input type="password" placeholder="Password Baru" className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" /><div className="flex gap-2"><button className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Simpan</button><button onClick={() => setShowPassword(false)} className="px-3 py-2 rounded-lg border border-input text-sm">Batal</button></div></div>)}<button onClick={() => { logout(); onClose(); }} className="w-full px-4 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Keluar dari Sistem</button></>)}
        </div>
      </div>
    </div>
  );
}
