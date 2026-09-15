"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Upload,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Film,
  FolderPlus,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MediaItem,
  MediaFolder,
  MediaAcceptType,
  formatBytes,
  isAllowedType,
} from "./media-helpers";
import { uploadMediaFile } from "./upload-media-file";
import { UploadProgressList, type UploadJob } from "./upload-progress-list";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: MediaItem[]) => void;
  multiple?: boolean;
  accept?: MediaAcceptType;
  title?: string;
}

const FILE_ACCEPT = {
  image: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif",
  video: "video/mp4,video/webm,video/ogg,video/quicktime",
  all: "image/*,video/mp4,video/webm,video/ogg,video/quicktime",
};

function MediaThumb({ item, className = "" }: { item: MediaItem; className?: string }) {
  if (item.type === "video") {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-1.5 bg-[var(--surface-secondary)] ${className}`}
      >
        <Film className="h-8 w-8 text-[var(--text-secondary)]" />
        <span className="max-w-full truncate px-1 text-[10px] text-[var(--text-muted)]">
          {item.originalName}
        </span>
      </div>
    );
  }
  return (
    <img
      src={item.url}
      alt={item.alt ?? item.originalName}
      loading="lazy"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  accept = "all",
  title = "انتخاب از رسانه",
}: MediaPickerDialogProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadJobs, setUploadJobs] = useState<UploadJob[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFolderParam = selectedFolderId === "none" ? "none" : selectedFolderId;

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
    const params = new URLSearchParams({ pageSize: "60" });
    if (debouncedSearch) params.set("search", debouncedSearch);
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
  }, [debouncedSearch, activeFolderParam]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected([]);
    setLoading(true);
    loadFolders();
    loadMedia();
  }, [open, loadFolders, loadMedia]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedFolderId]);

  const visibleItems = useMemo(
    () => items.filter((i) => isAllowedType(i.type, accept)),
    [items, accept]
  );

  const toggleSelect = (item: MediaItem) => {
    if (!multiple) {
      setSelected([item]);
      return;
    }
    setSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : [...prev, item]
    );
  };

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    e.target.value = "";

    const folderId =
      selectedFolderId && selectedFolderId !== "none" ? selectedFolderId : undefined;

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
        })
          .then((result) => {
            setUploadJobs((prev) => prev.filter((job) => job.id !== jobId));
            return result;
          })
          .catch((err: unknown) => {
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
        setSelectedFolderId(json.data.id);
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

  const handleConfirm = () => {
    onSelect(selected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-4xl">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Folders sidebar */}
          <aside className="hidden w-52 shrink-0 border-e border-border bg-background p-3 sm:block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">پوشهها</span>
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
                  className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm text-text outline-none focus:border-primary"
                />
                <Button
                  size="xs"
                  className="w-full"
                  onClick={handleCreateFolder}
                  disabled={creatingFolder}
                >
                  {creatingFolder ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "ایجاد"
                  )}
                </Button>
              </div>
            )}

            <nav className="space-y-1">
              <button
                onClick={() => setSelectedFolderId("")}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  selectedFolderId === ""
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                همه
              </button>
              <button
                onClick={() => setSelectedFolderId("none")}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                  selectedFolderId === "none"
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-secondary"
                }`}
              >
                <Folder className="h-4 w-4 shrink-0" />
                بدون پوشه
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderId(f.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                    selectedFolderId === f.id
                      ? "bg-primary text-primary-foreground"
                      : "text-text-secondary hover:bg-surface-secondary"
                  }`}
                >
                  <Folder className="h-4 w-4 shrink-0" />
                  <span className="truncate">{f.name}</span>
                  <span className="ms-auto text-xs">{f.count}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجوی نام فایل..."
                  className="w-full rounded-lg border border-border bg-surface py-2 pr-9 pl-3 text-sm text-text outline-none focus:border-primary"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={FILE_ACCEPT[accept]}
                onChange={handlePickFile}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
              >
                <Upload className="h-4 w-4" />
                بارگذاری
              </Button>
            </div>

            {uploadJobs.length > 0 && (
              <div className="border-b border-border px-3 py-3">
                <UploadProgressList jobs={uploadJobs} />
              </div>
            )}

            {/* Grid */}
            <div className="scrollbar-hide flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ImageIcon className="mb-2 h-10 w-10 text-text-muted" />
                  <p className="text-sm text-text-muted">
                    فایلی یافت نشد
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {visibleItems.map((item) => {
                    const isSelected = selected.some((s) => s.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleSelect(item)}
                        className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-gold-dark"
                        }`}
                        aria-pressed={isSelected}
                        title={`${item.originalName} · ${formatBytes(item.size)}`}
                      >
                        <MediaThumb item={item} />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1 pt-4">
                          <p className="truncate text-[11px] font-medium text-white">
                            {item.originalName}
                          </p>
                        </div>
                        <span className="absolute start-1 top-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                          {formatBytes(item.size)}
                        </span>
                        {isSelected && (
                          <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                            <Check className="h-4 w-4" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-sm text-text-muted">
              {selected.length > 0
                ? `${selected.length.toLocaleString("fa-IR")} مورد انتخاب شد`
                : "جهت انتخاب روی فایل کلیک کنید"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                انصراف
              </Button>
              <Button onClick={handleConfirm} disabled={selected.length === 0}>
                انتخاب
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
