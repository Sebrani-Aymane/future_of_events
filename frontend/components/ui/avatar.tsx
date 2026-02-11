"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    size?: "xs" | "sm" | "default" | "lg" | "xl";
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-white",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Convenience component that combines Avatar, AvatarImage, and AvatarFallback
interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  className?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

const UserAvatar = React.forwardRef<HTMLSpanElement, UserAvatarProps>(
  ({ src, name, size = "default", className, showOnlineIndicator = false, isOnline = false }, ref) => {
    const indicatorSizes = {
      xs: "h-1.5 w-1.5",
      sm: "h-2 w-2",
      default: "h-2.5 w-2.5",
      lg: "h-3 w-3",
      xl: "h-4 w-4",
    };

    return (
      <div className="relative inline-block">
        <Avatar ref={ref} size={size} className={className}>
          {src && <AvatarImage src={src} alt={name} />}
          <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
        {showOnlineIndicator && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-background",
              indicatorSizes[size],
              isOnline ? "bg-success" : "bg-muted-foreground"
            )}
          />
        )}
      </div>
    );
  }
);
UserAvatar.displayName = "UserAvatar";

// Avatar Group component
interface AvatarGroupProps {
  avatars: { src?: string | null; name: string }[];
  max?: number;
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  className?: string;
}

const AvatarGroup = ({ avatars, max = 4, size = "default", className }: AvatarGroupProps) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapClasses = {
    xs: "-ml-1.5",
    sm: "-ml-2",
    default: "-ml-3",
    lg: "-ml-4",
    xl: "-ml-5",
  };

  return (
    <div className={cn("flex items-center", className)}>
      {displayedAvatars.map((avatar, index) => (
        <UserAvatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          className={cn(
            "ring-2 ring-background",
            index > 0 && overlapClasses[size]
          )}
        />
      ))}
      {remainingCount > 0 && (
        <Avatar size={size} className={cn("ring-2 ring-background", overlapClasses[size])}>
          <AvatarFallback className="bg-charcoal-50 text-muted-foreground">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback, UserAvatar, AvatarGroup };
