import { useState, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Upload, Archive, Users, Shield, FileText, Settings,
  PanelLeftClose, PanelLeft, ChevronDown, Clock, CheckCircle, GitBranch,
  BarChart3, FolderOpen,
} from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";
import { useApp } from "@/contexts/AppContext";
import { SIDEBAR_FOLDERS, MODULE_DEFINITIONS } from "@/data/mockData";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasPermission, documents, currentUser } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Dropdown states
  const [dashOpen, setDashOpen] = useState(location.pathname === "/dashboard");
  const [arsipOpen, setArsipOpen] = useState(location.pathname === "/archive");
  const [approvalOpen, setApprovalOpen] = useState(location.pathname.startsWith("/approval"));

  const isGuru = currentUser.role === "Guru";
  const isOperator = currentUser.role === "Operator/TU";
  const isKepsek = currentUser.role === "Kepala Sekolah";

  const pendingCount = documents.filter((d) => d.status === "Menunggu").length;
  const showApproval = hasPermission("documents.approve") || (isOperator);

  // Count docs per folder path
  const folderCounts = useMemo(() => {
    const counts = {};
    SIDEBAR_FOLDERS.forEach((item) => {
      if (item.children) {
        item.children.forEach((child) => {
          counts[child.folder] = documents.filter((d) => {
            const parts = child.path.split("/");
            const catPart = parts.find((p) => p.startsWith("cat:"));
            const typePart = parts.find((p) => p.startsWith("type:"));
            const catId = catPart ? Number(catPart.split(":")[1]) : null;
            const typeId = typePart ? Number(typePart.split(":")[1]) : null;
            if (catId && d.category_id !== catId) return false;
            if (typeId && d.type_id !== typeId) return false;
            return true;
          }).length;
        });
      }
    });
    return counts;
  }, [documents]);

  // Role-based folder visibility
  const visibleFolders = useMemo(() => {
    return SIDEBAR_FOLDERS.filter((item) => {
      if (!item.module) return true; // "Semua Dokumen"
      if (isOperator) return true;
      if (isKepsek) return true;
      if (isGuru) {
        // Guru only sees Kepegawaian → Sertifikat/Diklat
        if (item.module === "Kepegawaian") return true;
        return false;
      }
      return true;
    }).map((item) => {
      if (!item.children || !isGuru) return item;
      if (item.module === "Kepegawaian" && isGuru) {
        return {
          ...item,
          children: item.children.filter((c) => c.folder === "sertifikat" || c.folder === "catatan-diklat"),
        };
      }
      return item;
    });
  }, [isGuru, isOperator, isKepsek]);

  const currentFolder = searchParams.get("folder");
  const approvalActive = location.pathname.startsWith("/approval");
  const dashActive = location.pathname === "/dashboard";
  const arsipActive = location.pathname === "/archive";

  // Simple nav items (non-dropdown)
  const simpleItems = [
    hasPermission("documents.upload") && { label: "Upload", icon: Upload, path: "/upload" },
    hasPermission("users.manage") && { label: "Pengguna", icon: Users, path: "/users" },
    hasPermission("roles.manage") && { label: "Role", icon: Shield, path: "/roles" },
    hasPermission("audit.view") && { label: "Log", icon: FileText, path: "/logs" },
  ].filter(Boolean);

  const NavButton = ({ active, icon: Icon, label, onClick, badge, indent }) => (
    <motion.button
      onClick={onClick}
      title={collapsed ? label : undefined}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full flex ${collapsed ? "flex-col items-center justify-center py-3 px-1" : "items-center gap-3 px-3 py-2.5"} rounded-xl font-medium transition-all duration-200 ${
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      } ${indent ? "pl-8" : ""}`}
    >
      {active && !collapsed && (
        <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
      )}
      <Icon size={collapsed ? 22 : 18} className={`shrink-0 ${active ? "text-primary" : ""}`} />
      {collapsed ? (
        <span className="text-[9px] mt-1 font-medium leading-tight text-center">{label}</span>
      ) : (
        <span className="text-[13px] flex-1 text-left">{label}</span>
      )}
      {badge && !collapsed && (
        <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span>
      )}
    </motion.button>
  );

  const DropdownGroup = ({ open, onToggle, active, icon: Icon, label, badge, children }) => (
    <div>
      {collapsed ? (
        <NavButton active={active} icon={Icon} label={label} badge={badge} onClick={() => children?.[0]?.props?.onClick?.()} />
      ) : (
        <>
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              active ? "bg-primary/[0.08] text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            }`}
          >
            {active && (
              <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
            )}
            <Icon size={18} className={`shrink-0 ${active ? "text-primary" : ""}`} />
            <span className="text-[13px] flex-1 text-left">{label}</span>
            {badge && <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span>}
            <ChevronDown size={14} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </motion.button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 h-screen bg-sidebar flex flex-col shrink-0 overflow-hidden border-r border-sidebar-border"
    >
      {/* Header */}
      <div className="px-3 pt-5 pb-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => setCollapsed(false)} title="Perluas sidebar" className="p-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
              <PanelLeft size={18} />
            </button>
            <button onClick={() => navigate("/home")} className="hover:opacity-80 transition-opacity">
              <img src={logoSakura} alt="SAKURA" className="w-9 h-9 rounded-xl" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <button onClick={() => navigate("/home")} className="hover:opacity-80 transition-opacity shrink-0">
              <img src={logoSakura} alt="SAKURA" className="w-9 h-9 rounded-xl" />
            </button>
            <button onClick={() => navigate("/home")} className="text-left hover:opacity-80 transition-opacity min-w-0 flex-1">
              <div className="text-primary font-bold text-sm tracking-wider">SAKURA</div>
              <div className="text-sidebar-foreground/50 text-[10px] font-medium">Document Management</div>
            </button>
            <button onClick={() => setCollapsed(true)} title="Sembunyikan sidebar" className="p-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Nav */}
      <nav className="flex-1 px-2 mt-3 space-y-1 overflow-y-auto scrollbar-thin">
        {/* Dashboard dropdown */}
        <DropdownGroup
          open={dashOpen}
          onToggle={() => setDashOpen(!dashOpen)}
          active={dashActive}
          icon={LayoutDashboard}
          label="Dashboard"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-[13px] rounded-lg transition-colors ${
              dashActive && !searchParams.get("tab") ? "text-primary font-medium border-l-[3px] border-primary ml-1" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
            }`}
          >
            <BarChart3 size={14} />
            <span className="flex-1 text-left">Ringkasan</span>
          </button>
          {(isOperator || isKepsek) && (
            <button
              onClick={() => navigate("/approval/pending")}
              className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-[13px] rounded-lg transition-colors ${
                approvalActive ? "text-primary font-medium border-l-[3px] border-primary ml-1" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <CheckCircle size={14} />
              <span className="flex-1 text-left">Persetujuan</span>
              {pendingCount > 0 && <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{pendingCount}</span>}
            </button>
          )}
        </DropdownGroup>

        {/* Arsip dropdown with folder tree */}
        <DropdownGroup
          open={arsipOpen}
          onToggle={() => setArsipOpen(!arsipOpen)}
          active={arsipActive}
          icon={Archive}
          label="Arsip"
        >
          {visibleFolders.map((item, idx) => {
            if (!item.module) {
              // "Semua Dokumen"
              return (
                <button
                  key="all"
                  onClick={() => navigate("/archive")}
                  className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-[12px] rounded-lg transition-colors ${
                    arsipActive && !currentFolder ? "text-primary font-medium bg-primary/[0.06]" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
                  }`}
                >
                  <FolderOpen size={13} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              );
            }
            return (
              <div key={item.module}>
                <div className="px-3 pt-3 pb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{item.module}</span>
                </div>
                {item.children.map((child) => (
                  <button
                    key={child.folder}
                    onClick={() => navigate(`/archive?folder=${child.folder}`)}
                    className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-[12px] rounded-md transition-colors ${
                      currentFolder === child.folder ? "bg-primary/[0.08] text-primary font-medium" : "text-sidebar-foreground/60 hover:bg-primary/[0.06] hover:text-primary"
                    }`}
                  >
                    <span className="flex-1 text-left">{child.label}</span>
                    {folderCounts[child.folder] > 0 && (
                      <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{folderCounts[child.folder]}</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </DropdownGroup>

        {/* Persetujuan dropdown (separate for Kepala Sekolah / Operator) */}
        {showApproval && (
          <DropdownGroup
            open={approvalOpen}
            onToggle={() => setApprovalOpen(!approvalOpen)}
            active={approvalActive}
            icon={GitBranch}
            label="Persetujuan"
            badge={pendingCount > 0 ? pendingCount : undefined}
          >
            <button
              onClick={() => navigate("/approval/pending")}
              className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-[13px] rounded-lg transition-colors ${
                location.pathname === "/approval/pending" ? "text-primary font-medium border-l-[3px] border-primary ml-1" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <Clock size={14} />
              <span className="flex-1 text-left">Pending</span>
              {pendingCount > 0 && <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{pendingCount}</span>}
            </button>
            <button
              onClick={() => navigate("/approval/approved")}
              className={`w-full flex items-center gap-2.5 pl-8 pr-3 py-2 text-[13px] rounded-lg transition-colors ${
                location.pathname === "/approval/approved" ? "text-primary font-medium border-l-[3px] border-primary ml-1" : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <CheckCircle size={14} />
              <span className="flex-1 text-left">Disetujui</span>
            </button>
          </DropdownGroup>
        )}

        {/* Simple nav items */}
        {simpleItems.map((item) => (
          <NavButton key={item.path} active={location.pathname === item.path} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
        ))}

        <div className="!my-4 mx-2 h-px bg-sidebar-border" />

        <NavButton active={location.pathname === "/settings"} icon={Settings} label="Pengaturan" onClick={() => navigate("/settings")} />
      </nav>

      <div className="flex-shrink-0 h-6" />
    </motion.aside>
  );
}
