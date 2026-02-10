"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, FolderOpen, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
  size = "default",
}: EmptyStateProps) => {
  const sizes = {
    sm: {
      wrapper: "py-8",
      icon: "h-10 w-10",
      title: "text-base",
      description: "text-sm",
    },
    default: {
      wrapper: "py-12",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      wrapper: "py-16",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.wrapper,
        className
      )}
    >
      <div className="rounded-full bg-charcoal-50 p-4">
        <Icon className={cn("text-muted-foreground", s.icon)} />
      </div>
      <h3 className={cn("mt-4 font-semibold", s.title)}>{title}</h3>
      {description && (
        <p className={cn("mt-1 max-w-sm text-muted-foreground", s.description)}>
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6"
          leftIcon={action.icon && <action.icon className="h-4 w-4" />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Specific empty state variants
const NoResultsState = ({
  searchQuery,
  onClear,
}: {
  searchQuery?: string;
  onClear?: () => void;
}) => (
  <EmptyState
    icon={Search}
    title="No results found"
    description={
      searchQuery
        ? `No results for "${searchQuery}". Try adjusting your search or filters.`
        : "No matching items found. Try adjusting your filters."
    }
    action={
      onClear
        ? {
            label: "Clear search",
            onClick: onClear,
          }
        : undefined
    }
  />
);

const ErrorState = ({
  title = "Something went wrong",
  description = "An error occurred while loading the data. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) => (
  <EmptyState
    icon={AlertCircle}
    title={title}
    description={description}
    action={
      onRetry
        ? {
            label: "Try again",
            onClick: onRetry,
          }
        : undefined
    }
  />
);

export { EmptyState, NoResultsState, ErrorState };
