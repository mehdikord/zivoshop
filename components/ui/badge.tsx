import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary-hover",
        secondary:
          "bg-surface-secondary text-text-secondary [a&]:hover:bg-secondary/90",
        gold: "border-gold-dark/30 bg-gold-light text-primary [a&]:hover:bg-gold-light/70",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        success:
          "border-success/25 bg-success-light text-success [a&]:hover:bg-success-light/70",
        warning:
          "border-warning/25 bg-warning-light text-warning [a&]:hover:bg-warning-light/70",
        info: "border-info/25 bg-info-light text-info [a&]:hover:bg-info-light/70",
        outline: "border-border text-text [a&]:hover:bg-surface-secondary",
        ghost: "[a&]:hover:bg-surface-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
