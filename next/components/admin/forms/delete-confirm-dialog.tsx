"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  title: string;
  message: string;
  onClose: () => void;
  onConfirmed: () => void;
}

export function DeleteConfirmDialog({
  title,
  message,
  onClose,
  onConfirmed,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--destructive-light)]">
            <AlertTriangle className="h-6 w-6 text-[var(--destructive)]" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-[var(--text)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-[var(--border)] p-5">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
          >
            انصراف
          </button>
          <button
            onClick={async () => {
              setDeleting(true);
              try {
                onConfirmed();
              } finally {
                setDeleting(false);
              }
            }}
            disabled={deleting}
            className="flex items-center gap-2 rounded-lg bg-[var(--destructive)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--destructive)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
