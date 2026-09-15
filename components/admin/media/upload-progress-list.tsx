"use client";

import { AlertCircle, Loader2 } from "lucide-react";

export type UploadJobStatus = "uploading" | "error";

export type UploadJob = {
  id: string;
  name: string;
  progress: number;
  status: UploadJobStatus;
  error?: string;
};

export function UploadProgressList({ jobs }: { jobs: UploadJob[] }) {
  if (jobs.length === 0) return null;

  return (
    <div className="space-y-2" aria-live="polite" aria-relevant="additions removals">
      {jobs.map((job) => {
        const isError = job.status === "error";
        const label = isError
          ? job.error || "خطا در آپلود"
          : `${job.progress.toLocaleString("fa-IR")}٪`;

        return (
          <div
            key={job.id}
            className={`rounded-lg border px-3 py-2.5 ${
              isError
                ? "border-destructive/40 bg-destructive/5"
                : "border-border bg-surface"
            }`}
          >
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              {isError ? (
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden />
              ) : (
                <Loader2
                  className="h-3.5 w-3.5 shrink-0 animate-spin text-primary motion-reduce:animate-none"
                  aria-hidden
                />
              )}
              <span className="min-w-0 flex-1 truncate font-medium text-text" title={job.name}>
                {job.name}
              </span>
              <span
                className={`shrink-0 tabular-nums ${
                  isError ? "text-destructive" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-secondary)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={isError ? undefined : job.progress}
              aria-label={`پیشرفت آپلود ${job.name}`}
            >
              <div
                className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-200 ${
                  isError ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${isError ? 100 : job.progress}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
