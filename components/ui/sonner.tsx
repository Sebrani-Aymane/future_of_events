"use client";

import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-charcoal group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Custom toast functions with icons
const showToast = {
  success: (message: string, description?: string) =>
    toast.success(message, {
      description,
      icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    }),

  error: (message: string, description?: string) =>
    toast.error(message, {
      description,
      icon: <XCircle className="h-5 w-5 text-error" />,
    }),

  warning: (message: string, description?: string) =>
    toast.warning(message, {
      description,
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
    }),

  info: (message: string, description?: string) =>
    toast.info(message, {
      description,
      icon: <Info className="h-5 w-5 text-info" />,
    }),

  loading: (message: string) =>
    toast.loading(message, {
      icon: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
    }),

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => toast.promise(promise, options),

  custom: (component: React.ReactNode) => toast.custom(() => component),

  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export { Toaster, showToast, toast };
