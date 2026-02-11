import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, leftIcon, rightIcon, ...props }, ref) => {
    const id = props.id ?? props.name ?? React.useId();

    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground/70"
          >
            {label}
            {props.required && <span className="ml-1 text-foreground/50">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/40">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={id}
            className={cn(
              "flex h-11 w-full rounded-lg border border-foreground/10 bg-charcoal-500 px-4 py-2 text-sm text-foreground shadow-sm transition-all duration-200",
              "placeholder:text-foreground/30",
              "focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-foreground/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "hover:border-foreground/20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-destructive/50 focus:border-destructive focus:ring-destructive/20",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/40">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${id}-helper`} className="text-sm text-foreground/40">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
