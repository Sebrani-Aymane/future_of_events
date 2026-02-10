import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background",
        primary: "bg-foreground/10 text-foreground border border-foreground/20",
        secondary: "bg-charcoal-300 text-foreground/80 border border-foreground/10",
        destructive: "bg-destructive/20 text-destructive border border-destructive/30",
        outline: "border border-foreground/30 text-foreground bg-transparent",
        success: "bg-foreground/10 text-foreground/90 border border-foreground/20",
        warning: "bg-foreground/10 text-foreground/80 border border-foreground/20",
        error: "bg-destructive/20 text-destructive border border-destructive/30",
        info: "bg-foreground/10 text-foreground/70 border border-foreground/15",
        gold: "bg-foreground/15 text-foreground border border-foreground/25",
        silver: "bg-foreground/10 text-foreground/80 border border-foreground/20",
        bronze: "bg-foreground/5 text-foreground/60 border border-foreground/15",
        subtle: "bg-foreground/5 text-foreground/60",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
