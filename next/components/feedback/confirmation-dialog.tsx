"use client";

import { useEffect } from "react";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmationDialogProps = {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description/question */
  description?: React.ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Callback when confirm is clicked */
  onConfirm: () => void;
  /** Variant for confirm button */
  confirmVariant?: "destructive" | "gold" | "outline";
  /** Icon to show in header */
  icon?: "warning" | "destructive" | "info";
  /** Whether to disable confirm button */
  disabled?: boolean;
};

/**
 * Generic confirmation dialog (PRD §55, §56) for destructive actions.
 * Used for: delete address, delete cart item with active discount, logout, etc.
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  onConfirm,
  confirmVariant = "destructive",
  icon = "warning",
  disabled = false,
}: ConfirmationDialogProps) {
  // Focus trap - focus confirm button on open
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const confirmBtn = document.querySelector('[data-confirm-btn]') as HTMLElement | null;
      confirmBtn?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  const iconMap = {
    warning: (
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-warning-light/60">
        <AlertTriangle className="size-6 text-warning" aria-hidden />
      </div>
    ),
    destructive: (
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive-light/60">
        <XCircle className="size-6 text-destructive" aria-hidden />
      </div>
    ),
    info: (
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-info-light/60">
        <CheckCircle className="size-6 text-info" aria-hidden />
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          {iconMap[icon]}
          <DialogTitle className="text-center">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={disabled}
            data-confirm-btn
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Pre-configured confirmation dialogs for common actions */
export const ConfirmDialogPresets = {
  /** Delete address */
  deleteAddress: (
    addressTitle: string,
    onConfirm: () => void,
    onCancel: () => void
  ) => (
    <ConfirmationDialog
      open={true}
      onOpenChange={onCancel}
      title="حذف آدرس"
      description={`آیا مطمئن هستید که می‌خواهید «${addressTitle}» را حذف کنید؟ این کار قابل بازگشت نیست.`}
      confirmLabel="حذف"
      confirmVariant="destructive"
      icon="destructive"
      onConfirm={onConfirm}
    />
  ),

  /** Delete cart item (especially with active discount) */
  deleteCartItem: (
    productName: string,
    onConfirm: () => void,
    onCancel: () => void,
    hasActiveDiscount = false
  ) => (
    <ConfirmationDialog
      open={true}
      onOpenChange={onCancel}
      title="حذف از سبد خرید"
      description={
        <>
          آیا مطمئن هستید که می‌خواهید «{productName}» را از سبد خرید حذف کنید؟{' '}
          {hasActiveDiscount && (
            <span className="text-warning">
              این محصول تخفیف فعال دارد.
            </span>
          )}
        </>
      }
      confirmLabel="حذف"
      confirmVariant="destructive"
      icon="destructive"
      onConfirm={onConfirm}
    />
  ),

  /** Logout */
  logout: (onConfirm: () => void, onCancel: () => void) => (
    <ConfirmationDialog
      open={true}
      onOpenChange={onCancel}
      title="خروج از حساب کاربری"
      description="آیا مطمئن هستید که می‌خواهید از حساب کاربری خود خارج شوید؟"
      confirmLabel="خروج"
      confirmVariant="outline"
      icon="info"
      onConfirm={onConfirm}
    />
  ),

  /** Generic destructive action */
  generic: (
    title: string,
    description: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmLabel = "تأیید"
  ) => (
    <ConfirmationDialog
      open={true}
      onOpenChange={onCancel}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      confirmVariant="destructive"
      icon="warning"
      onConfirm={onConfirm}
    />
  ),
};