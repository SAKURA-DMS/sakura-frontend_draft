import { useState, useMemo } from "react";
import { Search, RotateCcw, Folder, FolderOpen, Star, FileText as FileIcon, ChevronRight, ChevronDown, Download, Clock, X, Upload, Plus, Pencil, Trash2, Monitor, MoreVertical, FolderPlus, FilePlus, ArrowRightLeft, Grid2X2, Grid3X3, LayoutGrid, Home, GripVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import AppHeader from "@/components/layout/AppHeader";
import DocumentDetailModal from "@/components/modals/DocumentDetailModal";

import UploadForm from "@/components/upload/UploadForm";
import { useApp } from "@/contexts/AppContext";
import { useSettings } from "@/contexts/SettingsContext";
import { buildFolderTree, docMatchesFolder, docMatchesFolderStrict, KATEGORI_OPTIONS } from "@/data/mockData";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const STATUS_SECTIONS = [
{ key: "Menunggu", label: "Belum Disetujui", color: "text-sakura-warning", bgColor: "bg-sakura-warning/10 border-sakura-warning/20", badgeColor: "bg-sakura-warning/20 text-sakura-warning", opacity: true },
{ key: "Disetujui", label: "Disetujui", color: "text-sakura-success", bgColor: "bg-sakura-success/10 border-sakura-success/20", badgeColor: "bg-sakura-success/20 text-sakura-success", opacity: false },
{ key: "Diarsipkan", label: "Diarsipkan", color: "text-muted-foreground", bgColor: "bg-muted/50 border-border", badgeColor: "bg-muted text-muted-foreground", opacity: false },
{ key: "Ditolak", label: "Ditolak", color: "text-destructive", bgColor: "bg-destructive/5 border-destructive/20", badgeColor: "bg-destructive/20 text-destructive", opacity: false }];


export default function ArchivePage() {
  const { documents, toggleFavorite, currentUser, customFolders, createFolder, editFolder, deleteFolder, editDocument, moveDocument, deleteDocument } = useApp();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [detailDoc, setDetailDoc] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // CRUD modal states
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [createFolderParent, setCreateFolderParent] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDesc, setNewFolderDesc] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState(null);
  const [moveDestination, setMoveDestination] = useState("");

  const [contextMenu, setContextMenu] = useState(null);
  const [folderGridSize, setFolderGridSize] = useState("medium");

  const isAdmin = currentUser.role === "Operator/TU";

  // Filter documents based on access restriction
  const accessibleDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (currentUser.role === "Operator/TU") return true;
      const isSensitive = doc.category_id === 2 || doc.type_id === 12;
      if (!isSensitive) return true;
      if (currentUser.role === "Guru" && currentUser.nip) {
        return doc.nip === currentUser.nip || doc.pengunggah?.id === currentUser.id;
      }
      if (currentUser.role === "Kepala Sekolah") return true;
      return false;
    });
  }, [documents, currentUser]);

  const folderTree = useMemo(() => buildFolderTree(documents), [documents]);

  useMemo(() => {
    if (folderTree.length > 0 && expandedFolders.size === 0) {
      setExpandedFolders(new Set([folderTree[0].path]));
    }
  }, [folderTree]);

  const toggleExpand = (path) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  // Get subfolders of the currently selected folder for grid display (moved before filtered)
  const currentSubfolders = useMemo(() => {
    if (!selectedFolder) return folderTree; // show root folders
    const findNode = (nodes, targetPath) => {
      for (const node of nodes) {
        if (node.path === targetPath) return node;
        if (node.children) {
          const found = findNode(node.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };
    const node = findNode(folderTree, selectedFolder);
    return node?.children || [];
  }, [selectedFolder, folderTree]);

  const filtered = useMemo(() => {
    let docs = accessibleDocuments;
    if (showFavorites) docs = docs.filter((d) => d.favorite);
    if (selectedFolder) {
      const folderHasChildren = currentSubfolders.length > 0;
      docs = docs.filter((d) => docMatchesFolderStrict(d, selectedFolder, folderHasChildren));
    }
    if (statusFilter !== "Semua") docs = docs.filter((d) => d.status === statusFilter);
    if (categoryFilter !== "Semua") docs = docs.filter((d) => d.kategori === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d) => d.judul.toLowerCase().includes(q) || d.nomorDokumen.toLowerCase().includes(q) || d.pengunggah.nama.toLowerCase().includes(q));
    }
    return docs;
  }, [accessibleDocuments, search, statusFilter, categoryFilter, selectedFolder, showFavorites, currentSubfolders]);

  const groupedDocs = useMemo(() => {
    const groups = {};
    STATUS_SECTIONS.forEach((s) => {groups[s.key] = [];});
    filtered.forEach((doc) => {
      if (groups[doc.status]) groups[doc.status].push(doc);
    });
    return groups;
  }, [filtered]);

  const breadcrumbParts = useMemo(() => {
    if (!selectedFolder) return null;
    const findPath = (nodes, targetPath, trail = []) => {
      for (const node of nodes) {
        if (node.path === targetPath) return [...trail, { label: node.name, path: node.path }];
        if (targetPath.startsWith(node.path + "/")) {
          const result = findPath(node.children, targetPath, [...trail, { label: node.name, path: node.path }]);
          if (result) return result;
        }
      }
      return null;
    };
    return findPath(folderTree, selectedFolder) || [{ label: selectedFolder, path: selectedFolder }];
  }, [selectedFolder, folderTree]);

  const countDocsInFolder = (folderPath) => {
    return documents.filter((d) => docMatchesFolder(d, folderPath)).length;
  };

  // Flatten folder tree for move modal
  const flattenTree = (nodes, depth = 0) => {
    const result = [];
    nodes.forEach((node) => {
      result.push({ path: node.path, name: node.name, depth });
      if (node.children) result.push(...flattenTree(node.children, depth + 1));
    });
    return result;
  };
  const allFolders = useMemo(() => flattenTree(folderTree), [folderTree]);

  // --- CRUD Handlers ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim(), createFolderParent, newFolderDesc.trim());
    toast({ title: "Berhasil", description: `Folder '${newFolderName.trim()}' berhasil dibuat` });
    setNewFolderName("");
    setNewFolderDesc("");
    setShowCreateFolderModal(false);
    setCreateFolderParent(null);
  };

  const handleEdit = () => {
    if (!editName.trim()) return;
    if (editTarget.type === "folder") {
      editFolder(editTarget.data.id, { name: editName.trim(), description: editDesc.trim() });
      toast({ title: "Berhasil", description: `Folder '${editName.trim()}' berhasil diperbarui` });
    } else {
      editDocument(editTarget.data.id, { judul: editName.trim() });
      toast({ title: "Berhasil", description: `Dokumen '${editName.trim()}' berhasil diperbarui` });
    }
    setShowEditModal(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (deleteTarget.type === "folder") {
      deleteFolder(deleteTarget.id);
      toast({ title: "Berhasil", description: `Folder '${deleteTarget.name}' berhasil dihapus` });
    } else {
      deleteDocument(deleteTarget.id);
      if (previewDoc?.id === deleteTarget.id) setPreviewDoc(null);
      toast({ title: "Berhasil", description: `Dokumen '${deleteTarget.name}' berhasil dihapus` });
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleMove = () => {
    if (!moveDestination || !moveTarget) return;
    moveDocument(moveTarget.id, moveDestination);
    toast({ title: "Berhasil", description: `Dokumen '${moveTarget.judul}' berhasil dipindahkan` });
    setShowMoveModal(false);
    setMoveTarget(null);
    setMoveDestination("");
  };

  const openEditDoc = (doc) => {
    setEditTarget({ type: "file", data: doc });
    setEditName(doc.judul);
    setEditDesc("");
    setShowEditModal(true);
  };

  const openDeleteDoc = (doc) => {
    setDeleteTarget({ type: "file", id: doc.id, name: doc.judul });
    setShowDeleteConfirm(true);
  };

  const openMoveDoc = (doc) => {
    setMoveTarget(doc);
    setMoveDestination("");
    setShowMoveModal(true);
  };

  const handlePageClick = () => setContextMenu(null);

  const findFolderNode = (nodes, targetPath) => {
    for (const node of nodes) {
      if (node.path === targetPath) return node;
      if (node.children) {
        const found = findFolderNode(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedFolderNode = useMemo(() => {
    if (!selectedFolder) return null;
    return findFolderNode(folderTree, selectedFolder);
  }, [selectedFolder, folderTree]);

  const renderFolder = (folder, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.path);
    const hasChildren = folder.children.length > 0;
    const isSelected = selectedFolder === folder.path;
    const docCount = countDocsInFolder(folder.path);

    return (
      <div key={folder.path}>
        <div className="group flex items-center" style={{ paddingLeft: `${8 + depth * 16}px` }}>
          <TooltipProvider delayDuration={400}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (hasChildren) toggleExpand(folder.path);
                    setSelectedFolder(folder.path);
                    setShowFavorites(false);
                    setPreviewDoc(null);
                  }}
                  className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors min-w-0 ${
                  isSelected ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"}`
                  }>
                  
                  {/* Expand/collapse indicator */}
                  {hasChildren ?
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center text-muted-foreground">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span> :

                  <span className="w-4 shrink-0" />
                  }
                  {isExpanded && hasChildren ?
                  <FolderOpen size={15} className="text-sakura-warning shrink-0" /> :

                  <Folder size={15} className={`shrink-0 ${isSelected ? "text-primary" : hasChildren ? "text-muted-foreground" : "text-sakura-warning"}`} />
                  }
                  <span className="truncate text-left">{folder.name}</span>
                  {docCount > 0 &&
                  <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full shrink-0">{docCount}</span>
                  }
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[240px]">
                <p className="font-semibold text-xs">{folder.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {isAdmin &&
          <button
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({
                x: e.clientX, y: e.clientY, type: "folder",
                data: folder, parentPath: folder.path
              });
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0">
            
              <MoreVertical size={14} className="text-muted-foreground" />
            </button>
          }
        </div>
        {isExpanded && folder.children.map((child) => renderFolder(child, depth + 1))}
      </div>);

  };

  const gridColsClass = folderGridSize === "small" ? "grid-cols-4 sm:grid-cols-5 md:grid-cols-6" :
  folderGridSize === "large" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4";

  const renderDocCard = (doc, dimmed) =>
  <div
    key={doc.id}
    className={`group flex items-center gap-4 p-4 bg-card rounded-lg border transition cursor-pointer ${
    previewDoc?.id === doc.id ? "border-primary shadow-md" : "border-border hover:shadow"} ${
    dimmed ? "opacity-50" : ""}`}
    onClick={() => setPreviewDoc(doc)}>
    
      <button onClick={(e) => {e.stopPropagation();toggleFavorite(doc.id);}} className="shrink-0">
        <Star size={18} className={doc.favorite ? "fill-sakura-warning text-sakura-warning" : "text-muted-foreground hover:text-sakura-warning"} />
      </button>
      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <FileIcon size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-foreground truncate">{doc.judul}</div>
        <div className="text-xs text-muted-foreground">{doc.nomorDokumen} · {doc.kategori} · {doc.jenisDokumen}</div>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
    doc.status === "Disetujui" ? "bg-sakura-success/20 text-sakura-success" :
    doc.status === "Menunggu" ? "bg-sakura-warning/20 text-sakura-warning" :
    doc.status === "Ditolak" ? "bg-destructive/20 text-destructive" :
    "bg-muted text-muted-foreground"}`
    }>{doc.status}</span>
      {isAdmin &&
    <button
      onClick={(e) => {
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type: "file", data: doc });
      }}
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-muted transition-opacity shrink-0">
      
          <MoreVertical size={16} className="text-muted-foreground" />
        </button>
    }
    </div>;


  return (
    <div onClick={handlePageClick} className="flex flex-col h-full">
      <AppHeader title="Arsip Dokumen" subtitle="SMP Negeri 4 Cikarang Barat" />
      <div className="flex-1 overflow-hidden animate-fade-in">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left - Resizable Folder Tree Panel */}
          <ResizablePanel defaultSize={22} minSize={15} maxSize={40} className="bg-card">
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-3 pb-2 border-b border-border">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <Folder size={15} className="text-sakura-warning" /> Struktur Folder
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-auto p-2 space-y-0.5">
                <button
                  onClick={() => {setSelectedFolder(null);setShowFavorites(false);setPreviewDoc(null);}}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !selectedFolder && !showFavorites ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"}`
                  }>
                  
                  📂 Semua Dokumen
                </button>
                <button
                  onClick={() => {setShowFavorites(true);setSelectedFolder(null);setPreviewDoc(null);}}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  showFavorites ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"}`
                  }>
                  
                  <Star size={14} className="text-sakura-warning" /> Favorit
                </button>

                {isAdmin &&
                <button
                  onClick={() => {
                    setCreateFolderParent(null);
                    setNewFolderName("");
                    setNewFolderDesc("");
                    setShowCreateFolderModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1.5 mt-1 rounded-md border border-dashed border-primary/40 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
                  
                    <FolderPlus size={14} /> Buat Folder
                  </button>
                }

                <div className="h-px bg-border my-2" />

                {folderTree.map((folder) => renderFolder(folder))}
              </div>
            </div>
          </ResizablePanel>

          {/* Resize Handle */}
          <ResizableHandle withHandle className="bg-border hover:bg-primary/20 transition-colors" />

          {/* Center - Document list */}
          <ResizablePanel defaultSize={previewDoc ? 48 : 78} minSize={30}>
            <div className="h-full overflow-y-auto p-6 space-y-4">
              {/* Breadcrumb navigation */}
              {breadcrumbParts &&
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border flex-wrap">
                  <Home size={14} className="shrink-0" />
                  <ChevronRight size={12} className="shrink-0" />
                  <button onClick={() => {setSelectedFolder(null);setPreviewDoc(null);}} className="hover:text-primary transition-colors">
                    Arsip Dokumen
                  </button>
                  {breadcrumbParts.map((part, i) =>
                <span key={part.path} className="flex items-center gap-1.5">
                      <ChevronRight size={12} className="shrink-0" />
                      <button
                    onClick={() => {setSelectedFolder(part.path);setPreviewDoc(null);}}
                    className={`hover:text-primary transition-colors ${i === breadcrumbParts.length - 1 ? "font-semibold text-foreground" : ""}`}>
                    
                        {part.label}
                      </button>
                    </span>
                )}
                </div>
              }

              {/* Folder title + description */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {showFavorites ?
                    <><Star size={20} className="text-sakura-warning fill-sakura-warning" /> Dokumen Favorit</> :
                    selectedFolder ?
                    <><Folder size={20} className="text-sakura-warning" /> {breadcrumbParts ? breadcrumbParts[breadcrumbParts.length - 1]?.label : "Folder"}</> :

                    "Semua Dokumen Arsip"
                    }
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} dokumen ditemukan</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Grid size control */}
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button onClick={() => setFolderGridSize("small")} title="Kecil" className={`p-1.5 rounded ${folderGridSize === "small" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><Grid3X3 size={14} /></button>
                    <button onClick={() => setFolderGridSize("medium")} title="Sedang" className={`p-1.5 rounded ${folderGridSize === "medium" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><Grid2X2 size={14} /></button>
                    <button onClick={() => setFolderGridSize("large")} title="Besar" className={`p-1.5 rounded ${folderGridSize === "large" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={14} /></button>
                  </div>
                  {isAdmin && selectedFolder &&
                  <>
                      <Button variant="outline" size="sm" onClick={() => {setCreateFolderParent(selectedFolder);setNewFolderName("");setNewFolderDesc("");setShowCreateFolderModal(true);}}>
                        <FolderPlus size={14} className="mr-1.5" /> Sub-folder
                      </Button>
                      <Button size="sm" onClick={() => setShowUploadModal(true)}>
                        <FilePlus size={14} className="mr-1.5" /> Upload File
                      </Button>
                    </>
                  }
                </div>
              </div>

              {/* Subfolder cards in main area */}
              {currentSubfolders.length > 0 &&
              <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Folder</div>
                  <div className={`grid gap-2 ${gridColsClass}`}>
                    {currentSubfolders.map((subfolder) =>
                  <button
                    key={subfolder.path}
                    onClick={() => {
                      setSelectedFolder(subfolder.path);
                      if (!expandedFolders.has(subfolder.path) && subfolder.children?.length > 0) {
                        toggleExpand(subfolder.path);
                      }
                      setPreviewDoc(null);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-primary/30 transition-colors group">
                    
                        <Folder size={folderGridSize === "small" ? 24 : folderGridSize === "large" ? 40 : 32} className="text-sakura-warning group-hover:text-primary transition-colors" />
                        <span className={`text-center font-medium text-foreground leading-tight ${folderGridSize === "small" ? "text-[10px]" : "text-xs"}`}>
                          {subfolder.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{countDocsInFolder(subfolder.path)} dok</span>
                      </button>
                  )}
                  </div>
                </div>
              }

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nomor, judul, atau pengunggah..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  <option value="Semua">Semua Status</option>
                  <option>Menunggu</option><option>Disetujui</option><option>Ditolak</option><option>Diarsipkan</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                  <option value="Semua">Semua Kategori</option>
                  {KATEGORI_OPTIONS.map((k) => <option key={k}>{k}</option>)}
                </select>
                <button onClick={() => {setSearch("");setStatusFilter("Semua");setCategoryFilter("Semua");}} className="flex items-center gap-1 px-3 py-2 rounded-lg border border-input text-sm hover:bg-muted transition-colors">
                  <RotateCcw size={14} /> Reset
                </button>
                <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <Upload size={14} /> Upload Dokumen
                </button>
              </div>

              {/* Dokumen label */}
              {filtered.length > 0 &&
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dokumen</div>
              }

              {/* Results grouped by status */}
              {statusFilter !== "Semua" ?
              <div className="space-y-2">
                  {filtered.map((doc) => renderDocCard(doc, false))}
                  {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada dokumen ditemukan.</p>}
                </div> :

              <div className="space-y-6">
                  {STATUS_SECTIONS.map((section) => {
                  const docs = groupedDocs[section.key];
                  if (docs.length === 0) return null;
                  return (
                    <div key={section.key}>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${section.bgColor}`}>
                          <span className={`text-sm font-semibold ${section.color}`}>{section.label}</span>
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${section.badgeColor}`}>{docs.length}</span>
                        </div>
                        <div className="space-y-2">
                          {docs.map((doc) => renderDocCard(doc, section.opacity))}
                        </div>
                      </div>);

                })}
                  {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada dokumen ditemukan.</p>}
                </div>
              }
            </div>
          </ResizablePanel>

          {/* Right - Detail Panel (inline, not floating) */}
          {previewDoc &&
          <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
                <div className="h-full overflow-y-auto bg-card">
                  <div className="p-5 space-y-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-base">{previewDoc.judul}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{previewDoc.nomorDokumen}</p>
                      </div>
                      <button onClick={() => setPreviewDoc(null)} className="p-1 rounded hover:bg-muted shrink-0">
                        <X size={16} />
                      </button>
                    </div>

                    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                  previewDoc.status === "Disetujui" ? "bg-sakura-success/20 text-sakura-success" :
                  previewDoc.status === "Menunggu" ? "bg-sakura-warning/20 text-sakura-warning" :
                  previewDoc.status === "Ditolak" ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground"}`
                  }>{previewDoc.status}</span>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Kategori</div>
                        <div className="font-medium text-foreground">{previewDoc.kategori}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Jenis Dokumen</div>
                        <div className="font-medium text-foreground">{previewDoc.jenisDokumen}</div>
                      </div>
                      {previewDoc.kelas && previewDoc.kelas !== "-" &&
                    <div>
                          <div className="text-muted-foreground text-xs">Kelas</div>
                          <div className="font-medium text-foreground">{previewDoc.kelas}</div>
                        </div>
                    }
                      {previewDoc.namaSiswa &&
                    <div>
                          <div className="text-muted-foreground text-xs">Nama Siswa</div>
                          <div className="font-medium text-foreground">{previewDoc.namaSiswa}</div>
                        </div>
                    }
                      {previewDoc.tahunAjaran &&
                    <div>
                          <div className="text-muted-foreground text-xs">Tahun Ajaran</div>
                          <div className="font-medium text-foreground">{previewDoc.tahunAjaran}</div>
                        </div>
                    }
                      <div>
                        <div className="text-muted-foreground text-xs">Pengunggah</div>
                        <div className="font-medium text-foreground">{previewDoc.pengunggah.nama}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Tanggal Unggah</div>
                        <div className="font-medium text-foreground">{format(new Date(previewDoc.tanggalUpload), "dd/MM/yyyy")}</div>
                      </div>
                    </div>

                    {previewDoc.catatan &&
                  <div className="px-3 py-2 rounded-lg bg-sakura-warning/10 border border-sakura-warning/30 text-sm text-sakura-warning font-medium">
                        ⚠ {previewDoc.catatan}
                      </div>
                  }

                    <div className="flex gap-2">
                      <button
                      onClick={() => setDetailDoc(previewDoc)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                      
                        <FileIcon size={16} /> Lihat Detail Lengkap
                      </button>
                    </div>

                    {isAdmin &&
                  <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditDoc(previewDoc)}>
                           Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openMoveDoc(previewDoc)}>
                          <ArrowRightLeft size={14} className="mr-1.5" /> Pindahkan
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => openDeleteDoc(previewDoc)}>
                          <Trash2 size={14} className="mr-1.5" /> Hapus
                        </Button>
                      </div>
                  }

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock size={14} className="text-primary" />
                        <span className="font-semibold text-sm text-foreground">Jejak Aktivitas</span>
                      </div>
                      <div className="space-y-3">
                        {previewDoc.auditTrail.slice(0, 4).map((entry, i) =>
                      <div key={i} className="flex gap-2">
                            <img src={entry.user.avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground">{entry.user.nama}</div>
                              <div className="text-xs text-foreground">{entry.action}</div>
                              <div className="text-xs text-muted-foreground">{format(new Date(entry.time), "dd/MM/yyyy HH:mm")}</div>
                            </div>
                          </div>
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              </ResizablePanel>
            </>
          }
        </ResizablePanelGroup>
      </div>

      {/* Context Menu (floating) */}
      {contextMenu &&
      <div
        className="fixed z-[100] bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-in fade-in zoom-in-95"
        style={{ top: contextMenu.y, left: contextMenu.x }}
        onClick={(e) => e.stopPropagation()}>
        
          {contextMenu.type === "folder" &&
        <>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {setCreateFolderParent(contextMenu.data.path);setNewFolderName("");setNewFolderDesc("");setShowCreateFolderModal(true);setContextMenu(null);}}>
                <FolderPlus size={15} className="text-muted-foreground" /> Buat Sub-folder
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {setShowUploadModal(true);setContextMenu(null);}}>
                <FilePlus size={15} className="text-muted-foreground" /> Upload File
              </button>
              <div className="border-t border-border my-1" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {setEditTarget({ type: "folder", data: { id: contextMenu.data.folder_id || contextMenu.data.id, name: contextMenu.data.name } });setEditName(contextMenu.data.name);setEditDesc("");setShowEditModal(true);setContextMenu(null);}}>
                <Pencil size={15} className="text-muted-foreground" /> Edit Folder
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {setMoveTarget({ id: contextMenu.data.folder_id || contextMenu.data.id, judul: contextMenu.data.name, isFolder: true });setMoveDestination("");setShowMoveModal(true);setContextMenu(null);}}>
                <ArrowRightLeft size={15} className="text-muted-foreground" /> Pindahkan Folder
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => {setDeleteTarget({ type: "folder", id: contextMenu.data.folder_id || contextMenu.data.id, name: contextMenu.data.name });setShowDeleteConfirm(true);setContextMenu(null);}}>
                <Trash2 size={15} /> Hapus Folder
              </button>
            </>
        }
          {contextMenu.type === "file" &&
        <>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {openEditDoc(contextMenu.data);setContextMenu(null);}}>
                <Pencil size={15} className="text-muted-foreground" /> Edit
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors" onClick={() => {openMoveDoc(contextMenu.data);setContextMenu(null);}}>
                <ArrowRightLeft size={15} className="text-muted-foreground" /> Pindahkan ke Folder
              </button>
              <div className="border-t border-border my-1" />
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => {openDeleteDoc(contextMenu.data);setContextMenu(null);}}>
                <Trash2 size={15} /> Hapus
              </button>
            </>
        }
        </div>
      }

      {/* Create Folder Modal */}
      <Dialog open={showCreateFolderModal} onOpenChange={setShowCreateFolderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Folder Baru</DialogTitle>
            <DialogDescription>
              {createFolderParent ? "Membuat sub-folder di dalam folder yang dipilih" : "Membuat folder baru di root arsip"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nama Folder <span className="text-destructive">*</span></Label>
              <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Masukkan nama folder" autoFocus />
              {newFolderName !== undefined && newFolderName.trim() === "" && <p className="text-sm text-destructive">Nama folder wajib diisi</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-desc">Deskripsi Folder <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Textarea id="folder-desc" value={newFolderDesc} onChange={(e) => setNewFolderDesc(e.target.value)} placeholder="Masukkan deskripsi folder" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderModal(false)}>Batal</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Simpan Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editTarget?.type === "folder" ? "Folder" : "Dokumen"}</DialogTitle>
            <DialogDescription>Perbarui informasi {editTarget?.type === "folder" ? "folder" : "dokumen"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
            </div>
            {editTarget?.type === "folder" &&
            <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
              </div>
            }
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Batal</Button>
            <Button onClick={handleEdit} disabled={!editName.trim()}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Folder Modal */}
      <Dialog open={showMoveModal} onOpenChange={setShowMoveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pindahkan Dokumen</DialogTitle>
            <DialogDescription>Pilih folder tujuan untuk dokumen "{moveTarget?.judul}"</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[300px] overflow-y-auto">
            {allFolders.map((f) =>
            <button
              key={f.path}
              onClick={() => setMoveDestination(f.path)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              moveDestination === f.path ? "bg-primary/10 border border-primary text-primary font-medium" : "hover:bg-muted border border-transparent"}`
              }
              style={{ paddingLeft: `${12 + f.depth * 16}px` }}>
              
                <Folder size={15} className={moveDestination === f.path ? "text-primary" : "text-muted-foreground"} />
                {f.name}
              </button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveModal(false)}>Batal</Button>
            <Button onClick={handleMove} disabled={!moveDestination}>Pindahkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "folder" ?
              `Folder "${deleteTarget?.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.` :
              `Dokumen "${deleteTarget?.name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {detailDoc && <DocumentDetailModal document={detailDoc} onClose={() => setDetailDoc(null)} />}
      
      {showUploadModal &&
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowUploadModal(false)} />
          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-background rounded-2xl shadow-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Upload Dokumen</h2>
                <p className="text-sm text-muted-foreground">Form upload identik dengan halaman Upload Dokumen</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-muted"><X size={20} /></button>
            </div>
            <UploadForm onSuccess={() => setShowUploadModal(false)} onCancel={() => setShowUploadModal(false)} />
          </div>
        </div>
      }
    </div>);

}