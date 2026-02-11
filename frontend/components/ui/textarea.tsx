import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  helperText?: string;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, helperText, showCount, maxLength, ...props }, ref) => {
    const id = props.id ?? props.name ?? React.useId();
    const [charCount, setCharCount] = React.useState(
      typeof props.value === "string" ? props.value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
            {label}
            {props.required && <span className="ml-1 text-accent">*</span>}
          </label>
        )}
        <textarea
          id={id}
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border border-border bg-charcoal px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p id={`${id}-error`} className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : helperText ? (
            <p id={`${id}-helper`} className="text-sm text-muted-foreground">
              {helperText}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                charCount >= maxLength && "text-error"
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
