import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-transition-all tw-duration-200 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-indigo-500 focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50",
  {
    variants: {
      variant: {
        default: "tw-bg-indigo-600 tw-text-white tw-shadow hover:tw-bg-indigo-700 active:tw-bg-indigo-800",
        destructive: "tw-bg-red-500 tw-text-white tw-shadow-sm hover:tw-bg-red-600 active:tw-bg-red-700",
        outline: "tw-border tw-border-border tw-bg-transparent tw-text-foreground tw-shadow-sm hover:tw-bg-muted hover:tw-text-foreground",
        secondary: "tw-bg-muted tw-text-foreground tw-shadow-sm hover:tw-bg-muted/80",
        ghost: "tw-text-foreground hover:tw-bg-muted",
        link: "tw-text-indigo-600 dark:tw-text-indigo-400 tw-underline-offset-4 hover:tw-underline",
      },
      size: {
        default: "tw-h-9 tw-px-4 tw-py-2",
        sm: "tw-h-8 tw-rounded-md tw-px-3 tw-text-xs",
        lg: "tw-h-10 tw-rounded-md tw-px-8",
        icon: "tw-h-9 tw-w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }