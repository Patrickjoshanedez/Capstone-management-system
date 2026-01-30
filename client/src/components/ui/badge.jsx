import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "tw-inline-flex tw-items-center tw-rounded-md tw-border tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring focus:tw-ring-offset-2",
  {
    variants: {
      variant: {
        default: "tw-border-transparent tw-bg-indigo-600 tw-text-white tw-shadow hover:tw-bg-indigo-700",
        secondary: "tw-border-transparent tw-bg-muted tw-text-muted-foreground hover:tw-bg-muted/80",
        destructive: "tw-border-transparent tw-bg-red-500 tw-text-white tw-shadow hover:tw-bg-red-600",
        outline: "tw-text-foreground tw-border-border",
        // Custom Status Variants
        PROPOSED: "tw-border-transparent tw-bg-amber-500 tw-text-white hover:tw-bg-amber-600",
        APPROVED: "tw-border-transparent tw-bg-emerald-500 tw-text-white hover:tw-bg-emerald-600",
        REVISION: "tw-border-transparent tw-bg-red-500 tw-text-white hover:tw-bg-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />)
}

export { Badge, badgeVariants }