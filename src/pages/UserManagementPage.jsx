import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import { useApp } from "@/contexts/AppContext";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { Plus, Pencil, Trash2, X, Clock, UserCheck, UserX } from "lucide-react";
import avatarAdmin from "@/assets/avatar_admin.jpg";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";

const ALL_ROLES = ["Operator/TU", "Kepala Sekolah", "Guru"];
const EMPTY_FORM = { nama: "", email: "", role: "Guru", departemen: "" };

export default function UserManagementPage() {
  const { users, currentUser, addUser, updateUser, deleteUser, pendingUsers, activeUsers, activateUser, rejectRegistration } = useApp();
  const { toast } = useToast();
  const [profileUser, setProfileUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [activateTarget, setActivateTarget] = useState(null);
  const isAdmin = currentUser.role === "Operator/TU";

  const handleCreate = () => { if (!formData.nama.trim() || !formData.email.trim()) return; addUser({ ...formData, avatar: avatarAdmin }); setShowCreateModal(false); setFormData(EMPTY_FORM); };
  const handleEdit = () => { if (!editUserId || !formData.nama.trim() || !formData.email.trim()) return; updateUser(editUserId, formData); setEditUserId(null); setFormData(EMPTY_FORM); };
  const handleDelete = () => { if (!deleteUserId) return; deleteUser(deleteUserId); setDeleteUserId(null); };
  const openEdit = (u) => { setFormData({ nama: u.nama, email: u.email, role: u.role, departemen: u.departemen }); setEditUserId(u.id); };

  const handleActivate = () => {
    if (!activateTarget) return;
    activateUser(activateTarget.id);
    toast({ title: "Berhasil", description: `Akun ${activateTarget.nama} telah diaktifkan` });
    setActivateTarget(null);
  };

  const handleRejectRegistration = (user) => {
    rejectRegistration(user.id);
    toast({ title: "Ditolak", description: `Pendaftaran ${user.nama} ditolak` });
  };

  const UserFormModal = ({ title, onSubmit, submitLabel, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-foreground text-lg">{title}</h3><button onClick={onClose} className="p-1 rounded hover:bg-muted"><X size={18} /></button></div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-foreground mb-1">Nama Lengkap *</label><input value={formData.nama} onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))} placeholder="Nama lengkap" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Email *</label><input value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} placeholder="email@sakura.sch.id" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Role</label><select value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">{ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-foreground mb-1">Departemen</label><input value={formData.departemen} onChange={(e) => setFormData((p) => ({ ...p, departemen: e.target.value }))} placeholder="Contoh: Tata Usaha" className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
          <div className="flex gap-2 justify-end pt-2"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button><button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">{submitLabel}</button></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <AppHeader title="Manajemen User" subtitle="SMP Negeri 4 Cikarang Barat" />
      <div className="p-4 sm:p-8 animate-fade-in space-y-6">
        {/* Pending approval section */}
        {isAdmin && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-sakura-warning" />
              <h3 className="font-bold text-foreground">Menunggu Persetujuan</h3>
              {pendingUsers.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sakura-warning/20 text-sakura-warning">{pendingUsers.length}</span>
              )}
            </div>
            {pendingUsers.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">Tidak ada pendaftar baru</div>
            ) : (
              <div className="space-y-3">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-sakura-warning/[0.06] border border-sakura-warning/20">
                    <div className="w-10 h-10 rounded-full bg-sakura-warning/20 flex items-center justify-center text-sakura-warning font-bold text-sm shrink-0">
                      {u.nama.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{u.nama}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      {u.nip && <div className="text-xs text-muted-foreground">NIP: {u.nip}</div>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{u.role || "Guru"}</span>
                        {u.registeredAt && <span className="text-[11px] text-muted-foreground">Mendaftar {formatDistanceToNow(new Date(u.registeredAt), { addSuffix: true, locale: localeId })}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setActivateTarget(u)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sakura-success text-white text-[13px] font-semibold hover:opacity-90">
                        <UserCheck size={14} /> Aktifkan Akun
                      </button>
                      <button onClick={() => handleRejectRegistration(u)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-[13px] hover:bg-destructive/10">
                        <UserX size={14} /> Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-1 h-px bg-border" />
          <span className="px-3 text-xs text-muted-foreground bg-background">Pengguna Aktif</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Active users table */}
        <div>
          {isAdmin && (<div className="flex justify-end mb-4"><button onClick={() => { setFormData(EMPTY_FORM); setShowCreateModal(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><Plus size={16} /> Tambah User</button></div>)}
          <div className="bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30"><th className="text-left py-3 px-4 font-semibold">Pengguna</th><th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Email</th><th className="text-left py-3 px-4 font-semibold">Role</th><th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Departemen</th><th className="text-center py-3 px-4 font-semibold">Aksi</th></tr></thead>
              <tbody>{activeUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="font-medium text-foreground flex items-center gap-2">{u.nama}<span className="w-2 h-2 rounded-full bg-sakura-success inline-block" /></span></div></td>
                  <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">{u.role}</span></td>
                  <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{u.departemen}</td>
                  <td className="py-3 px-4 text-center"><div className="flex items-center justify-center gap-2">
                    {isAdmin && (<><button onClick={() => openEdit(u)} className="text-xs px-3 py-1 rounded-lg border border-input hover:bg-muted transition-colors flex items-center gap-1"><Pencil size={12} /> Edit</button>{u.id !== currentUser.id && (<button onClick={() => setDeleteUserId(u.id)} className="text-xs px-3 py-1 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1"><Trash2 size={12} /> Hapus</button>)}</>)}
                    <button onClick={() => setProfileUser(u)} className="text-xs px-3 py-1 rounded-lg border border-input hover:bg-muted transition-colors">Profil</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activate confirmation */}
      {activateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setActivateTarget(null)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-3">Aktifkan akun {activateTarget.nama}?</h3>
            <div className="text-sm text-muted-foreground space-y-1 mb-4">
              <p>NIP: {activateTarget.nip || "-"}</p>
              <p>Role akan ditetapkan sebagai: <span className="font-semibold text-foreground">Guru</span></p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setActivateTarget(null)} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button>
              <button onClick={handleActivate} className="px-4 py-2 rounded-lg bg-sakura-success text-white text-sm font-semibold hover:opacity-90">Ya, Aktifkan</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <UserFormModal title="Tambah User Baru" onSubmit={handleCreate} submitLabel="Tambah" onClose={() => setShowCreateModal(false)} />}
      {editUserId && <UserFormModal title="Edit User" onSubmit={handleEdit} submitLabel="Simpan" onClose={() => { setEditUserId(null); setFormData(EMPTY_FORM); }} />}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm" onClick={() => setDeleteUserId(null)}>
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-2">Hapus User</h3><p className="text-sm text-muted-foreground mb-4">Apakah Anda yakin ingin menghapus user ini?</p>
            <div className="flex gap-2 justify-end"><button onClick={() => setDeleteUserId(null)} className="px-4 py-2 rounded-lg border border-input text-sm hover:bg-muted">Batal</button><button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90">Hapus</button></div>
          </div>
        </div>
      )}
      {profileUser && <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
    </>
  );
}
