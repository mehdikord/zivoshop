export type MediaUploadResult = {
  id: string;
  originalName: string;
  url: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
  folderId: string | null;
};

/**
 * Upload a single media file with XHR so upload progress events are available.
 */
export function uploadMediaFile(
  file: File,
  options: {
    folderId?: string;
    onProgress?: (percent: number) => void;
  } = {}
): Promise<MediaUploadResult> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("files", file);
    if (options.folderId) {
      fd.append("folderId", options.folderId);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options.onProgress) return;
      const percent = Math.min(100, Math.round((event.loaded / event.total) * 100));
      options.onProgress(percent);
    };

    xhr.onload = () => {
      let json: {
        success?: boolean;
        message?: string;
        data?: MediaUploadResult[];
        count?: number;
      } = {};
      try {
        json = JSON.parse(xhr.responseText) as typeof json;
      } catch {
        reject(new Error("پاسخ نامعتبر از سرور"));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && json.success) {
        if (json.data?.[0]) {
          options.onProgress?.(100);
          resolve(json.data[0]);
          return;
        }
        reject(new Error(json.message || "فایل پذیرفته نشد (نوع یا حجم نامعتبر)"));
        return;
      }

      reject(new Error(json.message || "خطا در آپلود"));
    };

    xhr.onerror = () => reject(new Error("خطا در ارتباط با سرور"));
    xhr.onabort = () => reject(new Error("آپلود لغو شد"));
    xhr.send(fd);
  });
}
