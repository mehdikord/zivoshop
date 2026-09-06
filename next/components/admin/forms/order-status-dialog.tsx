"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, Package, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";

interface OrderStatusDialogProps {
  orderId: string;
  currentStatus: string;
  currentTrackNo?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
  returned: "مرجوعی",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  pending: "warning",
  processing: "default",
  shipped: "secondary",
  delivered: "success",
  cancelled: "destructive",
  returned: "outline",
};

const STATUS_ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  returned: AlertCircle,
};

const getStatusIcon = (status: string) => STATUS_ICONS_MAP[status];

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

interface OrderStatusDialogProps {
  orderId: string;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function OrderStatusDialog({ orderId, currentStatus, currentTrackNo, open, onOpenChange, onSuccess }: OrderStatusDialogProps) {
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [trackNo, setTrackNo] = useState(currentTrackNo ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allowedStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const showTrackNo = newStatus === "shipped" || Boolean(currentTrackNo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus && !trackNo) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note, trackNo }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.message || "خطا در تغییر وضعیت");
      }
    } catch {
      setError("خطای شبکه");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>تغییر وضعیت سفارش</span>
              <Badge variant={STATUS_COLORS[currentStatus] || "default"}>
                {currentStatus && getStatusIcon(currentStatus) && (() => { const Icon = getStatusIcon(currentStatus)!; return <Icon className="h-3 w-3 mr-1" />; })()}
                {STATUS_LABELS[currentStatus] || currentStatus}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">وضعیت جدید</label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={allowedStatuses.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.length === 0 ? (
                    <SelectItem disabled value="">هیچ تغییری مجاز نیست</SelectItem>
                  ) : (
                    allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(s) && (() => { const Icon = getStatusIcon(s)!; return <Icon className="h-4 w-4" />; })()}
                          {STATUS_LABELS[s] || s}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {allowedStatuses.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">این سفارش در وضعیت نهایی است و قابل تغییر نیست.</p>
              )}
            </div>

            {showTrackNo && (
              <div>
                <label htmlFor="trackNo" className="block text-sm font-medium mb-2">
                  کد رهگیری پستی
                </label>
                <Input
                  id="trackNo"
                  value={trackNo}
                  onChange={(e) => setTrackNo(e.target.value)}
                  placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  در صورت ارسال سفارش، کد رهگیری را وارد کنید تا برای مشتری قابل مشاهده باشد.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="note" className="block text-sm font-medium mb-2">
                یادداشت (اختیاری)
              </label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="دلیل تغییر وضعیت..."
                rows={3}
                className="resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              انصراف
            </Button>
            <Button type="submit" disabled={loading || (!newStatus && !trackNo)}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال انجام...
                </>
              ) : (
                "اعمال تغییرات"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}