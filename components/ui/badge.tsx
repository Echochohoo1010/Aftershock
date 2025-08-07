import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/12 text-primary border border-primary/20 hover:bg-primary/18 hover:border-primary/30",
        glass:
          "bg-white/10 backdrop-blur-sm border border-white/20 text-foreground hover:bg-white/15 hover:border-white/30",
        secondary:
          "bg-secondary/20 text-secondary-foreground border border-secondary/30 hover:bg-secondary/30",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/25 hover:bg-destructive/20",
        outline: "border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "glass",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }