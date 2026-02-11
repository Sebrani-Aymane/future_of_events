import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const cardVariants = cva(
  "rounded-xl border border-foreground/[0.06] bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-charcoal-500 shadow-elegant",
        elevated: "bg-charcoal-400 shadow-xl",
        outlined: "bg-transparent border border-foreground/10",
        ghost: "bg-transparent border-transparent shadow-none",
        gradient: "bg-gradient-card border-foreground/10",
        glow: "bg-charcoal-500 shadow-glow border-foreground/20",
        glass: "bg-foreground/[0.02] backdrop-blur-lg border-foreground/[0.06]",
        minimal: "bg-charcoal-600 border-foreground/[0.04]",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-card-hover hover:border-foreground/10",
        glow: "hover:shadow-glow hover:border-foreground/20",
        scale: "hover:scale-[1.02]",
        subtle: "hover:bg-charcoal-400 hover:border-foreground/10",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      padding: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, padding, animate = false, children, ...props }, ref) => {
    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(cardVariants({ variant, hover, padding, className }))}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, padding, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// Create compound component interface
interface CardCompound
  extends React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
}

// Assign compound components
const CardWithCompound = Card as CardCompound;
CardWithCompound.Header = CardHeader;
CardWithCompound.Title = CardTitle;
CardWithCompound.Description = CardDescription;
CardWithCompound.Content = CardContent;
CardWithCompound.Footer = CardFooter;

export { CardWithCompound as Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
