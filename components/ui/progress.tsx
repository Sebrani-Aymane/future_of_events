"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const progressVariants = cva("relative w-full overflow-hidden rounded-full bg-foreground/10", {
  variants: {
    size: {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  indicatorClassName?: string;
  showValue?: boolean;
  showLabel?: boolean; // Alias for showValue
  label?: string;
  animated?: boolean;
  color?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      size,
      indicatorClassName,
      showValue: showValueProp,
      showLabel,
      label,
      animated = true,
      color,
      ...props
    },
    ref
  ) => {
    const showValue = showValueProp || showLabel;
    return (
      <div className="w-full space-y-1.5">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && <span className="text-foreground/50">{label}</span>}
            {showValue && <span className="font-medium text-foreground/70">{value}%</span>}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 bg-foreground transition-all",
              animated && "duration-500 ease-out",
              indicatorClassName
            )}
            style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

// Circular progress component
interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
}

const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  label,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-charcoal-50"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#FF6B35" />
          </linearGradient>
        </defs>
      </svg>
      {showValue && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(value)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      )}
    </div>
  );
};

// Stats progress with target
interface StatsProgressProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
}

const StatsProgress = ({ label, value, target, unit = "" }: StatsProgressProps) => {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value.toLocaleString()}
          {unit} / {target.toLocaleString()}
          {unit}
        </span>
      </div>
      <Progress value={percentage} size="lg" />
    </div>
  );
};

export { Progress, CircularProgress, StatsProgress };
