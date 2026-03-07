"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PersonAvatarProps {
  name: string | null | undefined;
  imageUrl?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() ?? "?";
}

export function PersonAvatar({ name, imageUrl, size = "default", className }: PersonAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name ?? "Avatar"} />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
