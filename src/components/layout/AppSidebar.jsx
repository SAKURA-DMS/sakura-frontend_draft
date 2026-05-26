import { useState, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Upload, Archive, Users, Shield, FileText, Settings,
  PanelLeftClose, PanelLeft, ChevronDown, Clock, CheckCircle, GitBranch,
  BarChart3, FolderOpen, Trash2
} from "lucide-react";
import logoSakura from "@/assets/logo_sakura.png";
import { useApp } from "@/contexts/AppContext";
import { SIDEBAR_FOLDERS } from "@/data/mockData";

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { hasPermission, documents, currentUser } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  // Dropdown states
  const [dashOpen, setDashOpen] = useState(location.pathname === "/dashboard" || location.pathname.startsWith("/approval"));
  const [approvalSubOpen, setApprovalSubOpen] = useState(location.pathname.startsWith("/approval"));
  const [arsipOpen, setArsipOpen] = useState(location.pathname === "/archive");

  const isGuru = currentUser.role === "Guru";
  const isOperator = currentUser.role === "Operator/TU";
  const isKepsek = currentUser.role === "Kepala Sekolah";

  const pendingCount = documents.filter((d) => d.status === "Menunggu").length;
  const showApproval = hasPermission("documents.approve") || isOperator;

  // Count docs per folder
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

  const visibleFolders = useMemo(() => {
    return SIDEBAR_FOLDERS.filter((item) => {
      if (!item.module) return true;
      if (isOperator || isKepsek) return true;
      if (isGuru && item.module === "Kepegawaian") return true;
      return false;
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
  const dashActive = location.pathname === "/dashboard" || location.pathname.startsWith("/approval");
  const arsipActive = location.pathname === "/archive";

  const simpleItems = [
    hasPermission("documents.upload") && { label: "Upload", icon: Upload, path: "/upload" },
    hasPermission("users.manage") && { label: "Pengguna", icon: Users, path: "/users" },
    hasPermission("roles.manage") && { label: "Role", icon: Shield, path: "/roles" },
    hasPermission("audit.view") && { label: "Log", icon: FileText, path: "/logs" },
  ].filter(Boolean);

  const NavButton = ({ active, icon: Icon, label, onClick, badge }) => (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex ${collapsed ? "flex-col items-center justify-center py-3 px-1" : "items-center gap-3 px-3 py-2.5"} rounded-xl font-medium ${
        active
          ? "bg-primary/[0.08] text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      <Icon size={collapsed ? 22 : 18} className={`shrink-0 ${active ? "text-primary" : ""}`} />
      {!collapsed && <span className="text-[13px] flex-1 text-left">{label}</span>}
      {badge && !collapsed && <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span>}
    </button>
  );

  const DropdownGroup = ({ open, onToggle, active, icon: Icon, label, onClickNav, children, badge }) => (
    <div className="mb-1">
      {collapsed ? (
        <NavButton active={active} icon={Icon} label={label} badge={badge} onClick={onClickNav} />
      ) : (
        <>
          <div className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-medium ${active ? "bg-primary/[0.08] text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
            <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onClickNav}>
              <Icon size={18} className="shrink-0" />
              <span className="text-[13px]">{label}</span>
              {badge && <span className="ml-auto mr-2 text-[10px] font-bold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-center">{badge}</span>}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-sidebar-accent/80 shrink-0">
              <ChevronDown size={14} className={open ? "rotate-180" : ""} />
            </button>
          </div>
          <div className="overflow-hidden" style={{ display: open ? "block" : "none" }}>
            <div className="mt-1 pl-4 border-l border-sidebar-border/50 ml-5 space-y-1">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <aside
      className={`sticky top-0 h-screen bg-sidebar flex flex-col shrink-0 border-r border-sidebar-border ${collapsed ? "w-[72px]" : "w-[260px]"}`}
    >
      <div className="px-3 pt-5 pb-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <PanelLeft size={18} />
            </button>
            <button onClick={() => navigate("/home")} className="hover:opacity-80">
              <img src={logoSakura} alt="SAKURA" className="w-9 h-9 rounded-xl" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <button onClick={() => navigate("/home")} className="hover:opacity-80 shrink-0">
              <img src={logoSakura} alt="SAKURA" className="w-9 h-9 rounded-xl" />
            </button>
            <button onClick={() => navigate("/home")} className="text-left hover:opacity-80 min-w-0 flex-1">
              <div className="text-primary font-bold text-sm tracking-wider">SAKURA</div>
              <div className="text-sidebar-foreground/50 text-[10px] font-medium">Document Management</div>
            </button>
            <button onClick={() => setCollapsed(true)} className="p-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <PanelLeftClose size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="mx-4 h-px bg-sidebar-border" />

      <nav className="flex-1 px-2 mt-3 space-y-1 overflow-y-auto scrollbar-thin pb-4">
        {/* Dashboard Menu */}
        <DropdownGroup
          open={dashOpen}
          onToggle={() => setDashOpen(!dashOpen)}
          active={dashActive}
          icon={LayoutDashboard}
          label="Dashboard"
          onClickNav={() => navigate("/dashboard")}
        >
          <button
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-lg ${location.pathname === "/dashboard" ? "text-primary font-bold" : "text-sidebar-foreground/70 hover:text-primary"}`}
          >
            <BarChart3 size={14} /> Ringkasan
          </button>
          
          {showApproval && (
            <div className="mt-1">
              <div className="group/sub flex items-center justify-between text-xs rounded-lg hover:text-primary">
                <div className={`flex-1 flex items-center gap-2.5 px-3 py-1.5 cursor-pointer ${location.pathname.startsWith("/approval") ? "text-primary font-bold" : "text-sidebar-foreground/70"}`} onClick={() => navigate("/approval/pending")}>
                   <GitBranch size={14} /> Persetujuan
                </div>
                <button onClick={(e) => { e.stopPropagation(); setApprovalSubOpen(!approvalSubOpen); }} className="p-1 rounded hover:bg-sidebar-accent/50 text-sidebar-foreground/50 opacity-0 group-hover/sub:opacity-100">
                  <ChevronDown size={12} className={approvalSubOpen ? "rotate-180" : ""} />
                </button>
              </div>
              
              <div className="pl-6 space-y-0.5 mt-0.5" style={{ display: approvalSubOpen ? "block" : "none" }}>
                <button onClick={() => navigate("/approval/pending")} className={`w-full flex items-center justify-between px-2 py-1.5 text-[11px] rounded-lg ${location.pathname === "/approval/pending" ? "text-primary font-semibold" : "text-sidebar-foreground/60 hover:text-primary"}`}>
                  <div className="flex items-center gap-2"><Clock size={12} /> Pending</div>
                  {pendingCount > 0 && <span className="bg-primary text-white px-1.5 rounded-full">{pendingCount}</span>}
                </button>
                <button onClick={() => navigate("/approval/approved")} className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded-lg ${location.pathname === "/approval/approved" ? "text-primary font-semibold" : "text-sidebar-foreground/60 hover:text-primary"}`}>
                  <CheckCircle size={12} /> Disetujui
                </button>
              </div>
            </div>
          )}
        </DropdownGroup>

        {/* Arsip Menu */}
        <DropdownGroup
          open={arsipOpen}
          onToggle={() => setArsipOpen(!arsipOpen)}
          active={arsipActive}
          icon={Archive}
          label="Arsip"
          onClickNav={() => navigate("/archive")}
        >
          {visibleFolders.map((item, idx) => {
            if (!item.module) {
              return (
                <button key="all" onClick={() => navigate("/archive")} className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg ${!currentFolder && arsipActive ? "text-primary font-bold bg-primary/[0.06]" : "text-sidebar-foreground/70 hover:text-primary"}`}>
                  <FolderOpen size={14} /> {item.label}
                </button>
              );
            }
            return (
              <div key={item.module} className="mt-2">
                <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-muted-foreground uppercase">{item.module}</div>
                {item.children.map((child) => (
                  <button key={child.folder} onClick={() => navigate(`/archive?folder=${child.folder}`)} className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md ${currentFolder === child.folder ? "bg-primary/[0.08] text-primary font-bold" : "text-sidebar-foreground/60 hover:text-primary"}`}>
                    <span className="truncate pr-2">{child.label}</span>
                    {folderCounts[child.folder] > 0 && <span className="text-[9px] bg-muted px-1 rounded-full">{folderCounts[child.folder]}</span>}
                  </button>
                ))}
              </div>
            );
          })}
        </DropdownGroup>

        {/* Simple Nav Items */}
        {simpleItems.map((item) => (
          <NavButton key={item.path} active={location.pathname === item.path} icon={item.icon} label={item.label} onClick={() => navigate(item.path)} />
        ))}

        <div className="!my-4 mx-2 h-px bg-sidebar-border" />
        
        <NavButton active={location.pathname === "/trash"} icon={Trash2} label="Sampah" onClick={() => navigate("/trash")} />
        
        <NavButton active={location.pathname === "/settings"} icon={Settings} label="Pengaturan" onClick={() => navigate("/settings")} />
      </nav>
    </aside>
  );
}