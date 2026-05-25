import { Bell, User, LogOut, KeyRound, ChevronDown } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function AppHeader({ title, subtitle }) {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, logout } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8 py-4 bg-card/80 glass border-b border-border/60">
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {/* Notification */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2.5 rounded-xl hover:bg-muted transition-all duration-200"
            aria-label="Notifikasi"
          >
            <Bell size={18} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-14 z-50 w-80 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm text-foreground">Notifikasi</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs text-primary font-medium hover:underline">
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border scrollbar-thin">
                    {notifications.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">Tidak ada notifikasi</p>
                    )}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
                      >
                        <div className="text-sm text-foreground leading-relaxed">{n.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">{format(new Date(n.time), "dd/MM/yyyy HH:mm")}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted transition-all duration-200"
            aria-label="Profil"
          >
            <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-lg object-cover ring-2 ring-border" />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-foreground leading-tight">{currentUser.nama}</div>
              <div className="text-[10px] text-muted-foreground">{currentUser.role}</div>
            </div>
            <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-14 z-50 w-56 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="text-sm font-semibold text-foreground">{currentUser.nama}</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {currentUser.role}
                  </span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/profile"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <User size={16} className="text-muted-foreground" /> Profil Saya
                  </button>
                  <button
                    onClick={() => { setShowDropdown(false); navigate("/change-password"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    <KeyRound size={16} className="text-muted-foreground" /> Ubah Password
                  </button>
                </div>
                <div className="border-t border-border p-1">
                  <button
                    onClick={() => { setShowDropdown(false); logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/5 rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
