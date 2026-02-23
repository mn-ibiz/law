import { FileText, FileImage, File, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof FileText> = {
  "application/pdf": FileText,
  "application/msword": FileText,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileText,
  "application/vnd.ms-excel": FileSpreadsheet,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "image/jpeg": FileImage,
  "image/png": FileImage,
  "image/webp": FileImage,
  "text/plain": FileText,
};

interface FileTypeIconProps {
  mimeType: string | null;
  className?: string;
}

export function FileTypeIcon({ mimeType, className }: FileTypeIconProps) {
  const Icon = (mimeType && iconMap[mimeType]) || File;
  return <Icon className={cn("h-5 w-5 text-muted-foreground", className)} />;
}
