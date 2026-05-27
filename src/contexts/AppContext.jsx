import React, { createContext, useContext, useState, useRef } from "react";
import { USERS, DOCUMENTS, ROLE_PERMISSIONS, INITIAL_NOTIFICATIONS, DOCUMENT_TYPES, INITIAL_DOCUMENT_COUNTERS, FOLDERS } from "@/data/mockData.js";
import avatarAdmin from "@/assets/avatar_admin.jpg";

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }) => {
  // --- STATE PERSISTENCE (Menyimpan Status Login) ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("sakura_isLoggedIn") === "true";
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("sakura_currentUser");
    return saved ? JSON.parse(saved) : USERS[0];
  });

  const [users, setUsers] = useState(USERS);
  const [documents, setDocuments] = useState(DOCUMENTS);
  const [rolePermissions, setRolePermissions] = useState(ROLE_PERMISSIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [documentCounters, setDocumentCounters] = useState(INITIAL_DOCUMENT_COUNTERS);
  const countersRef = useRef(documentCounters);
  const [customFolders, setCustomFolders] = useState([]);
  const nextFolderIdRef = useRef(1000);

  // --- Helpers untuk Simpan Sesi ---
  const saveSession = (loggedIn, user) => {
    setIsLoggedIn(loggedIn);
    localStorage.setItem("sakura_isLoggedIn", loggedIn);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("sakura_currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("sakura_currentUser");
    }
  };

  // --- FUNGSI LOGIN & LOGOUT (Hanya Ada 1 Sekarang) ---
  const login = (email) => {
    const user = users.find((u) => u.email === email);
    if (!user) return false;
    if (user.status === "menunggu_approval") return "pending";
    saveSession(true, user); // <-- Ini yang akan menyimpan data login Anda
    return true;
  };

  const logout = () => {
    saveSession(false, null);
    // Navigation is handled by the calling component via React Router
  };

  // --- Folder CRUD ---
  const createFolder = (folderName, parentPath = null, description = "") => {
    const id = nextFolderIdRef.current++;
    const newFolder = { id, name: folderName, parentPath, description, isCustom: true, createdAt: new Date().toISOString() };
    setCustomFolders((prev) => [...prev, newFolder]);
    return newFolder;
  };

  const editFolder = (folderId, data) => {
    setCustomFolders((prev) => prev.map((f) => f.id === folderId ? { ...f, ...data } : f));
  };

  const deleteFolder = (folderId) => {
    setCustomFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  // --- Document CRUD ---
  const editDocument = (docId, data) => {
    setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, ...data, tanggalEdit: new Date().toISOString() } : d));
  };

  const moveDocument = (docId, newFolderPath) => {
    const parts = newFolderPath.split("/");
    const catPart = parts.find((p) => p.startsWith("cat:"));
    const typePart = parts.find((p) => p.startsWith("type:"));
    const yearPart = parts.find((p) => p.startsWith("year:"));
    const catId = catPart ? Number(catPart.split(":")[1]) : null;
    const typeId = typePart ? Number(typePart.split(":")[1]) : null;
    const year = yearPart ? yearPart.split(":")[1] : null;

    if (!catId) return;

    const cat = FOLDERS.find((f) => f.category_id === catId && f.parent_id === null);
    const docType = typeId ? DOCUMENT_TYPES.find((t) => t.type_id === typeId) : null;

    setDocuments((prev) => prev.map((d) => {
      if (d.id !== docId) return d;
      return {
        ...d,
        category_id: catId,
        kategori: cat?.folder_name || d.kategori,
        type_id: typeId || d.type_id,
        jenisDokumen: docType?.type_name || d.jenisDokumen,
        tahunAjaran: year || d.tahunAjaran,
        tanggalEdit: new Date().toISOString(),
      };
    }));
  };

  const deleteDocument = (docId) => {
    setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, deletedAt: new Date().toISOString() } : d));
  };

  const restoreDocument = (docId) => {
    setDocuments((prev) => prev.map((d) => {
      if (d.id !== docId) return d;
      const { deletedAt, ...rest } = d;
      return rest;
    }));
  };

  const permanentlyDeleteDocument = (docId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const generateDocumentNumber = (typeId) => {
    const docType = DOCUMENT_TYPES.find((t) => t.type_id === typeId);
    if (!docType) return `DOC-${Date.now()}`;
    const prefix = docType.code_prefix;
    const year = new Date().getFullYear();
    const counters = countersRef.current;
    const existing = counters.find((c) => c.prefix === prefix && c.year === year);
    let nextSeq;
    let updated;
    if (existing) {
      nextSeq = existing.last_seq + 1;
      updated = counters.map((c) => (c.prefix === prefix && c.year === year ? { ...c, last_seq: nextSeq } : c));
    } else {
      nextSeq = 1;
      updated = [...counters, { prefix, year, last_seq: 1 }];
    }
    countersRef.current = updated;
    setDocumentCounters(updated);
    return `${prefix}/${year}/${String(nextSeq).padStart(3, "0")}`;
  };

  // --- Users & Roles ---
  const registerUser = (userData) => {
    const newUser = { ...userData, id: Date.now(), status: "menunggu_approval", avatar: avatarAdmin, registeredAt: new Date().toISOString() };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const activateUser = (userId) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: "active", role: u.role || "Guru" } : u));
  };

  const rejectRegistration = (userId) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const pendingUsers = users.filter((u) => u.status === "menunggu_approval");
  const activeUsers = users.filter((u) => u.status !== "menunggu_approval");

  const hasPermission = (permission) => {
    return rolePermissions[currentUser.role]?.includes(permission) ?? false;
  };

  const updateUserRole = (userId, newRole) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser.id === userId) {
      const updatedUser = { ...currentUser, role: newRole };
      saveSession(true, updatedUser); // Update sesi lokal juga
    }
  };

  const updateUserAvatar = (userId, avatar) => {
    if (userId !== currentUser.id) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, avatar } : u)));
    const updatedUser = { ...currentUser, avatar };
    saveSession(true, updatedUser); // Update sesi lokal juga
  };

  const togglePermission = (role, permission) => {
    setRolePermissions((prev) => {
      const current = prev[role];
      const next = current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission];
      return { ...prev, [role]: next };
    });
  };

  const addAuditNote = (docId, note) => {
    if (!hasPermission("audit.addNote")) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const newTrail = [...d.auditTrail, { time: new Date().toISOString(), user: { nama: currentUser.nama, avatar: currentUser.avatar, role: currentUser.role }, action: `Catatan Admin: ${note}` }];
        return { ...d, auditTrail: newTrail };
      })
    );
  };

  const approveDocument = (docId, comment) => {
    if (!hasPermission("documents.approve")) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || d.status !== "Menunggu") return d;
        return {
          ...d, status: "Diarsipkan", tanggalEdit: new Date().toISOString(),
          auditTrail: [...d.auditTrail,
            { time: new Date().toISOString(), user: { nama: currentUser.nama, avatar: currentUser.avatar, role: currentUser.role }, action: comment ? `Menyetujui dokumen: ${comment}` : "Menyetujui dokumen" },
            { time: new Date().toISOString(), user: { nama: "Sistem", avatar: currentUser.avatar, role: "Sistem" }, action: "Dokumen otomatis diarsipkan setelah persetujuan" },
          ],
        };
      })
    );
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setNotifications((prev) => [{ id: Date.now(), message: `Dokumen '${doc.judul}' telah disetujui dan diarsipkan`, time: new Date().toISOString(), read: false, type: "approval", docId }, ...prev]);
    }
  };

  const rejectDocument = (docId, reason) => {
    if (!hasPermission("documents.reject")) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || d.status !== "Menunggu") return d;
        return {
          ...d, status: "Ditolak", tanggalEdit: new Date().toISOString(), catatan: reason,
          auditTrail: [...d.auditTrail, { time: new Date().toISOString(), user: { nama: currentUser.nama, avatar: currentUser.avatar, role: currentUser.role }, action: `Menolak dokumen: ${reason}` }],
        };
      })
    );
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setNotifications((prev) => [{ id: Date.now(), message: `Dokumen '${doc.judul}' telah ditolak`, time: new Date().toISOString(), read: false, type: "rejection", docId }, ...prev]);
    }
  };

  const uploadDocument = (doc) => {
    if (!hasPermission("documents.upload")) return;
    const newDoc = {
      ...doc, id: Date.now(), status: "Menunggu", versi: 1, tanggalEdit: doc.tanggalUpload,
      auditTrail: [{ time: doc.tanggalUpload, user: { nama: currentUser.nama, avatar: currentUser.avatar, role: currentUser.role }, action: "Mengunggah dokumen" }],
    };
    if (!newDoc.folder_id && newDoc.folderTujuan) {
      const created = createFolder(newDoc.folderTujuan, null, "Auto-created from upload");
      newDoc.customFolderId = created.id;
    }
    setDocuments((prev) => [newDoc, ...prev]);
    setNotifications((prev) => [{ id: Date.now(), message: `Dokumen '${doc.judul}' telah diunggah dan menunggu persetujuan`, time: doc.tanggalUpload, read: false, type: "upload", docId: newDoc.id }, ...prev]);
  };

  const archiveDocument = (docId) => {
    if (!hasPermission("documents.archive")) return;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId || d.status !== "Disetujui") return d;
        return {
          ...d, status: "Diarsipkan", tanggalEdit: new Date().toISOString(),
          auditTrail: [...d.auditTrail, { time: new Date().toISOString(), user: { nama: currentUser.nama, avatar: currentUser.avatar, role: currentUser.role }, action: "Mengarsipkan dokumen" }],
        };
      })
    );
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setNotifications((prev) => [{ id: Date.now(), message: `Dokumen '${doc.judul}' berhasil diarsipkan`, time: new Date().toISOString(), read: false, type: "archive", docId }, ...prev]);
    }
  };

  const toggleFavorite = (docId) => {
    setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, favorite: !d.favorite } : d));
  };

  const markNotificationRead = (notifId) => {
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addUser = (user) => {
    if (currentUser.role !== "Operator/TU") return;
    const newUser = { ...user, id: Date.now() };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (userId, data) => {
    if (currentUser.role !== "Operator/TU") return;
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, ...data } : u));
    if (currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...data };
      saveSession(true, updatedUser); // Update sesi lokal juga
    }
  };

  const updateProfile = (data) => {
    const allowed = { nama: data.nama };
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, ...allowed } : u));
    const updatedUser = { ...currentUser, ...allowed };
    saveSession(true, updatedUser); // Update sesi lokal juga
  };

  const changePassword = (currentPw, newPw) => {
    const user = users.find((u) => u.id === currentUser.id);
    if ((user.password || "password123") !== currentPw) return false;
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, password: newPw } : u));
    return true;
  };

  const deleteUser = (userId) => {
    if (currentUser.role !== "Operator/TU") return false;
    if (userId === currentUser.id) return false;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return true;
  };

  const setTwoFactorEnabled = (enabled) => {
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, twoFactorEnabled: enabled } : u));
    const updatedUser = { ...currentUser, twoFactorEnabled: enabled };
    saveSession(true, updatedUser);
    // Persist per-email so login page can check it after logout
    if (enabled) {
      localStorage.setItem(`sakura_2fa_${currentUser.email}`, "true");
    } else {
      localStorage.removeItem(`sakura_2fa_${currentUser.email}`);
    }
  };

  // Derived collections
  const trashedDocuments = documents.filter((d) => d.deletedAt);
  const activeDocuments = documents.filter((d) => !d.deletedAt);

  const visibleNotifications = notifications.filter((n) => {
    if (currentUser.role === "Operator/TU") return n.type !== "approval" || true;
    if (currentUser.role === "Kepala Sekolah") return ["approval", "upload", "rejection", "archive"].includes(n.type);
    return false;
  });

  return (
    <AppContext.Provider value={{
      currentUser, users, documents, activeDocuments, trashedDocuments,
      rolePermissions, notifications, visibleNotifications, isLoggedIn, customFolders,
      pendingUsers, activeUsers,
      login, logout, updateUserRole, updateUserAvatar, togglePermission, addAuditNote,
      hasPermission, approveDocument, rejectDocument, uploadDocument, archiveDocument,
      toggleFavorite, markNotificationRead, markAllNotificationsRead,
      addUser, updateUser, deleteUser, generateDocumentNumber, updateProfile, changePassword,
      registerUser, activateUser, rejectRegistration,
      createFolder, editFolder, deleteFolder, editDocument, moveDocument, deleteDocument,
      restoreDocument, permanentlyDeleteDocument, setTwoFactorEnabled,
    }}>
      {children}
    </AppContext.Provider>
  );
};