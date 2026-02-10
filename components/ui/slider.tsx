"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  valueLabel?: (value: number[]) => string;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, label, showValue = true, valueLabel, ...props }, ref) => {
    const value = props.value ?? props.defaultValue ?? [0];
    const displayValue = valueLabel ? valueLabel(value) : value.join(" - ");

    return (
      <div className="w-full space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-sm font-medium text-foreground/80">{label}</span>}
            {showValue && (
              <span className="text-sm font-semibold text-primary">{displayValue}</span>
            )}
          </div>
        )}
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          {...props}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-charcoal-50">
            <SliderPrimitive.Range className="absolute h-full bg-gradient-primary" />
          </SliderPrimitive.Track>
          {value.map((_, index) => (
            <SliderPrimitive.Thumb
              key={index}
              className="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-glow"
            />
          ))}
        </SliderPrimitive.Root>
      </div>
    );
  }
);
Slider.displayName = SliderPrimitive.Root.displayName;

// Score slider component for judging
interface ScoreSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const ScoreSlider = ({
  label,
  description,
  value,
  onChange,
  min = 1,
  max = 10,
}: ScoreSliderProps) => {
  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-error";
    if (score <= 5) return "text-warning";
    if (score <= 7) return "text-info";
    return "text-success";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 2) return "Poor";
    if (score <= 4) return "Below Average";
    if (score <= 6) return "Average";
    if (score <= 8) return "Good";
    return "Excellent";
  };

  return (
    <div className="space-y-3 rounded-xl bg-charcoal-100 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{label}</h4>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span className={cn("text-2xl font-bold", getScoreColor(value))}>
            {value}
          </span>
          <span className="text-muted-foreground">/{max}</span>
          <p className={cn("text-xs", getScoreColor(value))}>{getScoreLabel(value)}</p>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v ?? min)}
        min={min}
        max={max}
        step={1}
        showValue={false}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export { Slider, ScoreSlider };
