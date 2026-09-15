"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Images,
  Search,
  Upload,
  Folder,
  FolderOpen,
  FolderPlus,
  Trash2,
  Pencil,
  ArrowRightToLine,
  X,
  Film,
  Loader2,
  Check,
  Image as ImageIcon,
  FileVideo,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/admin/forms/delete-confirm-dialog";
import {
  MediaItem,
  MediaFolder,
  MediaAcceptType,
  formatBytes,
  formatMediaDate,
} from "@/components/admin/media/media-helpers";
import { uploadMediaFile } from "@/components/admin/media/upload-media-file";
import {
  UploadProgressList,
  type UploadJob,
} from "@/components/admin/media/upload-progress-list";

const FILE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/ogg,video/quicktime";

function MediaThumb({ item }: { item: MediaItem }) {
  if (item.type === "video") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[var(--surface-secondary)] p-2">
        <Film className="h-8 w-8 text-[var(--text-secondary)]" />
        <span className="line-clamp-1 text-[10px] text-[var(--text-muted)]">{item.originalName}</span>
      </div>
    );
  }
  return (
    <img src={item.url} alt={item.alt ?? item.originalName} loading="lazy" className="h-full w-full object-cover" />
  );
}

export default function MediaPage() {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaAcceptType>("all");
  const [activeFolderId, setActiveFolderId] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);

  // Dialogs
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<MediaFolder | null>(null);
  const [editFolderTarget, setEditFolderTarget] = useState<MediaFolder | null>(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [savingFolder, setSavingFolder] = useState(false);

  const [editItemTarget, setEditItemTarget] = useState<MediaItem | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemAlt, setEditItemAlt] = useState("");
  const [savingItem, setSavingItem] = useState(false);
  const [deleteItemTarget, setDeleteItemTarget] = useState<MediaItem | null>(null);
  const [moveTargets, setMoveTargets] = useState<MediaItem[] | null>(null);
  const [moveFolderId, setMoveFolderId] = useState("");
  const [moving, setMoving] = useState(false);
  const [preview, setPreview] = useState<MediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFolderParam = activeFolderId === "none" ? "none" : activeFolderId;

  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media/folders");
      const json = await res.json();
      if (json.success) setFolders(json.data);
    } catch {
      // ignore
    }
  }, []);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setSelected([]);
    const params = new URLSearchParams({ pageSize: "100" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (activeFolderParam) params.set("folderId", activeFolderParam);
    try {
      const res = await fetch(`/api/admin/media?${params}`);
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast.error("خطا در دریافت رسانه");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, activeFolderParam]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFolders();
    loadMedia();
  }, [loadFolders, loadMedia]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    e.target.value = "";

    const folderId =
      activeFolderId && activeFolderId !== "none" ? activeFolderId : undefined;

    const jobs: UploadJob[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${file.name}`,
      name: file.name,
      progress: 0,
      status: "uploading" as const,
    }));

    setUploadJobs((prev) => [...prev, ...jobs]);

    const results = await Promise.allSettled(
      files.map((file, index) => {
        const jobId = jobs[index]!.id;
        return uploadMediaFile(file, {
          folderId,
          onProgress: (percent) => {
            setUploadJobs((prev) =>
              prev.map((job) =>
                job.id === jobId && job.status === "uploading"
                  ? { ...job, progress: percent }
                  : job
              )
            );
          },
        }).then((result) => {
          setUploadJobs((prev) => prev.filter((job) => job.id !== jobId));
          return result;
        }).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "خطا در آپلود";
          setUploadJobs((prev) =>
            prev.map((job) =>
              job.id === jobId
                ? { ...job, status: "error", error: message, progress: 100 }
                : job
            )
          );
          window.setTimeout(() => {
            setUploadJobs((prev) => prev.filter((job) => job.id !== jobId));
          }, 3500);
          throw err;
        });
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      toast.success(`${successCount.toLocaleString("fa-IR")} فایل آپلود شد`);
      loadFolders();
      loadMedia();
    }
    if (failCount > 0 && successCount === 0) {
      toast.error("آپلود فایل‌ها ناموفق بود");
    } else if (failCount > 0) {
      toast.error(`${failCount.toLocaleString("fa-IR")} فایل آپلود نشد`);
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("نام پوشه را وارد کنید");
      return;
    }
    setCreatingFolder(true);
    try {
      const res = await fetch("/api/admin/media/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("پوشه ایجاد شد");
        setNewFolderName("");
        setShowNewFolder(false);
        setActiveFolderId(json.data.id);
        await loadFolders();
        await loadMedia();
      } else {
        toast.error(json.message || "خطا در ایجاد پوشه");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!editFolderTarget) return;
    const name = editFolderName.trim();
    if (!name) {
      toast.error("نام پوشه را وارد کنید");
      return;
    }
    setSavingFolder(true);
    try {
      const res = await fetch(`/api/admin/media/folders/${editFolderTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("پوشه تغییر یافت");
        setEditFolderTarget(null);
        await loadFolders();
      } else {
        toast.error(json.message || "خطا در تغییر نام");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setSavingFolder(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    try {
      const res = await fetch(`/api/admin/media/folders/${deleteFolderTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("پوشه حذف شد");
        if (activeFolderId === deleteFolderTarget.id) setActiveFolderId("");
        setDeleteFolderTarget(null);
        await loadFolders();
        await loadMedia();
      } else {
        toast.error(json.message || "خطا در حذف پوشه");
        setDeleteFolderTarget(null);
      }
    } catch {
      toast.error("خطای شبکه");
    }
  };

  const handleSaveItem = async () => {
    if (!editItemTarget) return;
    const name = editItemName.trim();
    if (!name) {
      toast.error("نام فایل الزامی است");
      return;
    }
    setSavingItem(true);
    try {
      const res = await fetch(`/api/admin/media/${editItemTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalName: name, alt: editItemAlt.trim() || null }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("فایل بهروزرسانی شد");
        setEditItemTarget(null);
        loadMedia();
      } else {
        toast.error(json.message || "خطا در ذخیره");
      }
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return;
    try {
      const res = await fetch(`/api/admin/media/${deleteItemTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("فایل حذف شد");
        setSelected((prev) => prev.filter((s) => s !== deleteItemTarget.id));
        setDeleteItemTarget(null);
        loadFolders();
        loadMedia();
      } else {
        toast.error(json.message || "خطا در حذف");
        setDeleteItemTarget(null);
      }
    } catch {
      toast.error("خطای شبکه");
    }
  };

  const openMove = (itemsToMove: MediaItem[]) => {
    if (itemsToMove.length === 0) return;
    setMoveTargets(itemsToMove);
    setMoveFolderId(itemsToMove[0]?.folderId ?? "");
  };

  const handleMove = async () => {
    if (!moveTargets || moveTargets.length === 0) return;
    setMoving(true);
    try {
      await Promise.all(
        moveTargets.map((item) =>
          fetch(`/api/admin/media/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folderId: moveFolderId || null }),
          })
        )
      );
      toast.success(`${moveTargets.length} فایل منتقل شد`);
      setMoveTargets(null);
      setSelected([]);
      loadFolders();
      loadMedia();
    } catch {
      toast.error("خطای شبکه");
    } finally {
      setMoving(false);
    }
  };

  const folderOf = (id: string | null) =>
    id ? folders.find((f) => f.id === id)?.name ?? null : null;

  const inputCls =
    "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Images className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">مدیریت رسانه</h1>
            <p className="text-sm text-[var(--text-muted)]">
              {items.length.toLocaleString("fa-IR")} فایل در این نمای
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={FILE_ACCEPT}
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          بارگذاری فایل
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Folders */}
        <aside className="rounded-xl border border-border bg-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-text">پوشهها</span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => {
                setShowNewFolder((v) => !v);
                setNewFolderName("");
              }}
              title="پوشه جدید"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>

          {showNewFolder && (
            <div className="mb-2 space-y-2">
              <input
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") setShowNewFolder(false);
                }}
                placeholder="نام پوشه"
                className={inputCls}
              />
              <Button size="xs" className="w-full" onClick={handleCreateFolder} disabled={creatingFolder}>
                {creatingFolder ? <Loader2 className="h-3 w-3 animate-spin" /> : "ایجاد"}
              </Button>
            </div>
          )}

          <nav className="space-y-1">
            <button
              onClick={() => setActiveFolderId("")}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                activeFolderId === ""
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              همه
            </button>
            <button
              onClick={() => setActiveFolderId("none")}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                activeFolderId === "none"
                  ? "bg-primary text-primary-foreground"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              بدون پوشه
            </button>
            {folders.map((f) => (
              <div
                key={f.id}
                className={`group flex items-center rounded-lg ${
                  activeFolderId === f.id
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                <button
                  onClick={() => setActiveFolderId(f.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-sm"
                >
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="ms-auto text-xs">{f.count}</span>
                </button>
                <div className="hidden shrink-0 items-center gap-0.5 pe-1 group-hover:flex">
                  <button
                    onClick={() => {
                      setEditFolderTarget(f);
                      setEditFolderName(f.name);
                    }}
                    className="rounded p-1 hover:bg-black/10"
                    title="تغییر نام"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteFolderTarget(f)}
                    className="rounded p-1 hover:bg-black/10"
                    title="حذف پوشه"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Media grid */}
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی نام فایل..."
                className="w-full rounded-lg border border-border bg-surface py-2 pr-9 pl-3 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as MediaAcceptType)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="all">همه نوعها</option>
              <option value="image">تصاویر</option>
              <option value="video">ویدئوها</option>
            </select>
          </div>

          {uploadJobs.length > 0 && (
            <div className="mb-3">
              <UploadProgressList jobs={uploadJobs} />
            </div>
          )}

          {selected.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-gold-dark/40 bg-gold-light/20 p-2.5">
              <span className="me-1 text-sm font-medium text-text">
                {selected.length.toLocaleString("fa-IR")} مورد انتخاب
              </span>
              <Button size="sm" variant="outline" onClick={() => openMove(items.filter((i) => selected.includes(i.id)))}>
                <ArrowRightToLine className="h-4 w-4" />
                انتقال به پوشه
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                const target = items.find((i) => selected.includes(i.id));
                if (target) setDeleteItemTarget(target);
              }}>
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                انصراف
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-surface text-center">
              <Images className="mb-2 h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-muted">فایلی یافت نشد</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                اولین فایل را بارگذاری کنید
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {items.map((item) => {
                const isSelected = selected.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-gold-dark"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setPreview(item)}
                      className="block h-full w-full"
                      title={item.originalName}
                    >
                      <MediaThumb item={item} />
                    </button>
                    <button
                      onClick={() => toggleSelect(item.id)}
                      aria-pressed={isSelected}
                      className={`absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-black/40 text-white hover:border-primary"
                      }`}
                      title={isSelected ? "لغو انتخاب" : "انتخاب"}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                    <span className="absolute start-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                      {item.type === "video" ? <FileVideo className="inline h-3 w-3 me-0.5" /> : <ImageIcon className="inline h-3 w-3 me-0.5" />}
                      {formatBytes(item.size)}
                    </span>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1 pt-5">
                      <p className="truncate text-[11px] font-medium text-white">{item.originalName}</p>
                      <p className="truncate text-[10px] text-white/70">
                        {item.folderName ?? folderOf(item.folderId) ?? "بدون پوشه"} · {formatMediaDate(item.createdAt)}
                      </p>
                    </div>
                    <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-black/40 group-hover:flex">
                      <button
                        onClick={() => setPreview(item)}
                        className="rounded-lg bg-white/90 p-1.5 text-text hover:bg-white"
                        title="پیشنمایش"
                      >
                        <FolderOpen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditItemTarget(item);
                          setEditItemName(item.originalName);
                          setEditItemAlt(item.alt ?? "");
                        }}
                        className="rounded-lg bg-white/90 p-1.5 text-text hover:bg-white"
                        title="ویرایش"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openMove([item])}
                        className="rounded-lg bg-white/90 p-1.5 text-text hover:bg-white"
                        title="انتقال"
                      >
                        <ArrowRightToLine className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteItemTarget(item)}
                        className="rounded-lg bg-white/90 p-1.5 text-destructive hover:bg-white"
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-surface p-0 shadow-soft-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-text">{preview.originalName}</h3>
                <p className="text-xs text-text-muted">
                  {formatBytes(preview.size)}
                  {preview.width ? ` · ${preview.width}×${preview.height}` : ""} ·{" "}
                  {formatMediaDate(preview.createdAt)}
                </p>
              </div>
              <button onClick={() => setPreview(null)} className="rounded-lg p-2 text-text-muted hover:bg-surface-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-background p-4">
              {preview.type === "video" ? (
                <video src={preview.url} controls className="mx-auto max-h-[65vh] w-auto rounded-lg" />
              ) : (
                <img src={preview.url} alt={preview.alt ?? preview.originalName} className="mx-auto max-h-[65vh] w-auto rounded-lg" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit item */}
      {editItemTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditItemTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-text">ویرایش فایل</h3>
              <button onClick={() => setEditItemTarget(null)} className="rounded-lg p-2 text-text-muted hover:bg-surface-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">نام فایل</label>
                <input value={editItemName} onChange={(e) => setEditItemName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">متن جایگزین (Alt)</label>
                <input value={editItemAlt} onChange={(e) => setEditItemAlt(e.target.value)} className={inputCls} placeholder="توضیح کوتاه برای تصویر" />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="outline" onClick={() => setEditItemTarget(null)}>انصراف</Button>
              <Button onClick={handleSaveItem} disabled={savingItem}>
                {savingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rename folder */}
      {editFolderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditFolderTarget(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-text">تغییر نام پوشه</h3>
              <button onClick={() => setEditFolderTarget(null)} className="rounded-lg p-2 text-text-muted hover:bg-surface-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <input
                autoFocus
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
                className={inputCls}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="outline" onClick={() => setEditFolderTarget(null)}>انصراف</Button>
              <Button onClick={handleRenameFolder} disabled={savingFolder}>
                {savingFolder ? <Loader2 className="h-4 w-4 animate-spin" /> : "ذخیره"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Move dialog */}
      {moveTargets && moveTargets.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setMoveTargets(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-semibold text-text">
                انتقال {moveTargets.length.toLocaleString("fa-IR")} فایل
              </h3>
              <button onClick={() => setMoveTargets(null)} className="rounded-lg p-2 text-text-muted hover:bg-surface-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <select
                value={moveFolderId}
                onChange={(e) => setMoveFolderId(e.target.value)}
                className={inputCls}
              >
                <option value="">بدون پوشه</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-4">
              <Button variant="outline" onClick={() => setMoveTargets(null)}>انصراف</Button>
              <Button onClick={handleMove} disabled={moving}>
                {moving ? <Loader2 className="h-4 w-4 animate-spin" /> : "انتقال"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteFolderTarget && (
        <DeleteConfirmDialog
          title="حذف پوشه"
          message={`آیا از حذف پوشه "${deleteFolderTarget.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeleteFolderTarget(null)}
          onConfirmed={handleDeleteFolder}
        />
      )}
      {deleteItemTarget && (
        <DeleteConfirmDialog
          title="حذف فایل"
          message={`آیا از حذف فایل "${deleteItemTarget.originalName}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeleteItemTarget(null)}
          onConfirmed={handleDeleteItem}
        />
      )}
    </div>
  );
}
