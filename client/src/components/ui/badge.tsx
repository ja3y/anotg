import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground",
        secondary:
          "bg-secondary text-secondary-foreground",
        outline:
          "border border-input bg-background",
        positive:
          "bg-[rgba(0,200,83,0.1)] text-[#00C853] dark:bg-[rgba(0,200,83,0.05)] dark:text-[#00C853]",
        negative:
          "bg-[rgba(244,67,54,0.1)] text-[#F44336] dark:bg-[rgba(244,67,54,0.05)] dark:text-[#F44336]",
        warning:
          "bg-[rgba(255,193,7,0.1)] text-[#FFC107] dark:bg-[rgba(255,193,7,0.05)] dark:text-[#FFC107]",
        flagged:
          "bg-[rgba(255,193,7,0.1)] text-[#FFC107] dark:bg-[rgba(255,193,7,0.1)] dark:text-[#FFC107]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
