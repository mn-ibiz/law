"use client";

import { useState, useRef, useCallback } from "react";
import { siteConfig } from "@/lib/config/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { upsertFirmSetting } from "@/lib/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Scale,
  Upload,
  X,
  Loader2,
  RotateCcw,
  Eye,
  Palette,
  Type,
  Building2,
  FileText,
  Mail,
  Check,
  ImageIcon,
  Info,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Clock,
  FileCheck,
  Home,
  ChevronRight,
  Bell,
  Search,
  Settings,
  Receipt,
  Copy,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────── */
/*                         Types                                  */
/* ────────────────────────────────────────────────────────────── */

interface BrandingFormProps {
  initialData: {
    logoUrl: string | null;
    firmName: string | null;
    tagline: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    sidebarColor: string | null;
    sidebarTextColor: string | null;
    fontFamily: string | null;
    invoiceFooter: string | null;
    address: string | null;
    emailHeaderColor: string | null;
  };
}

/* ────────────────────────────────────────────────────────────── */
/*                       Constants                                */
/* ────────────────────────────────────────────────────────────── */

const COLOR_PRESETS = [
  {
    name: "Classic Navy",
    primary: "#1e3a5f",
    accent: "#3b82f6",
    sidebar: "#0f172a",
    sidebarText: "#e2e8f0",
    emailHeader: "#1e3a5f",
  },
  {
    name: "Burgundy & Gold",
    primary: "#7c2d12",
    accent: "#d97706",
    sidebar: "#451a03",
    sidebarText: "#fef3c7",
    emailHeader: "#7c2d12",
  },
  {
    name: "Forest Green",
    primary: "#166534",
    accent: "#16a34a",
    sidebar: "#052e16",
    sidebarText: "#dcfce7",
    emailHeader: "#166534",
  },
  {
    name: "Slate Professional",
    primary: "#334155",
    accent: "#64748b",
    sidebar: "#1e293b",
    sidebarText: "#cbd5e1",
    emailHeader: "#334155",
  },
  {
    name: "Royal Purple",
    primary: "#581c87",
    accent: "#9333ea",
    sidebar: "#3b0764",
    sidebarText: "#e9d5ff",
    emailHeader: "#581c87",
  },
  {
    name: "Deep Teal",
    primary: "#115e59",
    accent: "#14b8a6",
    sidebar: "#042f2e",
    sidebarText: "#ccfbf1",
    emailHeader: "#115e59",
  },
] as const;

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", css: "'Inter', sans-serif", category: "Sans-serif" },
  { value: "georgia", label: "Georgia", css: "Georgia, serif", category: "Serif" },
  { value: "times-new-roman", label: "Times New Roman", css: "'Times New Roman', serif", category: "Serif" },
  { value: "garamond", label: "Garamond", css: "Garamond, serif", category: "Serif" },
  { value: "system-ui", label: "System Default", css: "system-ui, sans-serif", category: "System" },
] as const;

const DEFAULTS = {
  primaryColor: "#1e3a5f",
  accentColor: "#3b82f6",
  sidebarColor: "#0f172a",
  sidebarTextColor: "#e2e8f0",
  fontFamily: "inter",
  emailHeaderColor: "#1e3a5f",
};

const SIDEBAR_NAV_ITEMS = [
  { label: "Dashboard", icon: Home, active: true },
  { label: "Cases", icon: Briefcase, active: false },
  { label: "Clients", icon: Users, active: false },
  { label: "Calendar", icon: Calendar, active: false },
  { label: "Billing", icon: Receipt, active: false },
  { label: "Documents", icon: FileText, active: false },
  { label: "Time Tracking", icon: Clock, active: false },
  { label: "Reports", icon: BarChart3, active: false },
];

/* ────────────────────────────────────────────────────────────── */
/*                     Sub-Components                             */
/* ────────────────────────────────────────────────────────────── */

function ColorField({
  id,
  label,
  value,
  onChange,
  description,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  description?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyHex() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={copyHex}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy hex"}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative shrink-0">
          <div
            className="h-10 w-10 rounded-lg border shadow-sm"
            style={{ backgroundColor: value }}
          />
          <Input
            id={id}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-10 w-10 cursor-pointer opacity-0"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={value}
          className="flex-1 font-mono text-sm uppercase"
          maxLength={7}
        />
      </div>
      {description && (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

function SectionBadge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        variant === "info"
          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          : "bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function CompletionIndicator({
  fields,
}: {
  fields: { label: string; filled: boolean }[];
}) {
  const filled = fields.filter((f) => f.filled).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Profile completeness</span>
        <span className="font-semibold tabular-nums">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
      <div className="flex flex-wrap gap-1.5 mt-1">
        {fields.map((f) => (
          <Badge
            key={f.label}
            variant={f.filled ? "default" : "outline"}
            className={cn(
              "text-[10px] transition-colors",
              f.filled
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20"
                : "text-muted-foreground"
            )}
          >
            {f.filled && <Check className="h-2.5 w-2.5 mr-0.5" />}
            {f.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/*                      Main Component                            */
/* ────────────────────────────────────────────────────────────── */

export function BrandingForm({ initialData }: BrandingFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showDarkPreview, setShowDarkPreview] = useState(false);

  // Form state
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl ?? "");
  const [firmName, setFirmName] = useState(initialData.firmName ?? "");
  const [tagline, setTagline] = useState(initialData.tagline ?? "");
  const [email, setEmail] = useState(initialData.email ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const [website, setWebsite] = useState(initialData.website ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    initialData.primaryColor ?? DEFAULTS.primaryColor
  );
  const [accentColor, setAccentColor] = useState(
    initialData.accentColor ?? DEFAULTS.accentColor
  );
  const [sidebarColor, setSidebarColor] = useState(
    initialData.sidebarColor ?? DEFAULTS.sidebarColor
  );
  const [sidebarTextColor, setSidebarTextColor] = useState(
    initialData.sidebarTextColor ?? DEFAULTS.sidebarTextColor
  );
  const [fontFamily, setFontFamily] = useState(
    initialData.fontFamily ?? DEFAULTS.fontFamily
  );
  const [invoiceFooter, setInvoiceFooter] = useState(
    initialData.invoiceFooter ?? ""
  );
  const [address, setAddress] = useState(initialData.address ?? "");
  const [emailHeaderColor, setEmailHeaderColor] = useState(
    initialData.emailHeaderColor ?? DEFAULTS.emailHeaderColor
  );

  /* ── Handlers ── */

  const handleFileUpload = useCallback(async (file: File) => {
    if (
      !["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(
        file.type
      )
    ) {
      toast.error("Only JPEG, PNG, WebP, and SVG images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
      const { fileUrl } = await res.json();
      setLogoUrl(fileUrl);
      setLogoError(false);
      toast.success("Logo uploaded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  function applyPreset(preset: (typeof COLOR_PRESETS)[number]) {
    setPrimaryColor(preset.primary);
    setAccentColor(preset.accent);
    setSidebarColor(preset.sidebar);
    setSidebarTextColor(preset.sidebarText);
    setEmailHeaderColor(preset.emailHeader);
    toast.success(`Applied "${preset.name}" color scheme`);
  }

  function resetToDefaults() {
    setPrimaryColor(DEFAULTS.primaryColor);
    setAccentColor(DEFAULTS.accentColor);
    setSidebarColor(DEFAULTS.sidebarColor);
    setSidebarTextColor(DEFAULTS.sidebarTextColor);
    setFontFamily(DEFAULTS.fontFamily);
    setEmailHeaderColor(DEFAULTS.emailHeaderColor);
    toast.info("Colors reset to defaults");
  }

  async function handleSave() {
    setSaving(true);
    try {
      const settings = [
        { key: "firm_logo_url", value: logoUrl, description: "Firm logo URL" },
        { key: "firm_name", value: firmName, description: "Firm display name" },
        { key: "firm_tagline", value: tagline, description: "Firm tagline" },
        { key: "firm_email", value: email, description: "Firm email address" },
        { key: "firm_phone", value: phone, description: "Firm phone number" },
        { key: "firm_website", value: website, description: "Firm website" },
        { key: "firm_primary_color", value: primaryColor, description: "Primary brand color" },
        { key: "firm_accent_color", value: accentColor, description: "Accent brand color" },
        { key: "firm_sidebar_color", value: sidebarColor, description: "Sidebar background color" },
        { key: "firm_sidebar_text_color", value: sidebarTextColor, description: "Sidebar text color" },
        { key: "firm_font_family", value: fontFamily, description: "Brand font family" },
        { key: "firm_invoice_footer", value: invoiceFooter, description: "Invoice footer text" },
        { key: "firm_address", value: address, description: "Firm address for documents" },
        { key: "firm_email_header_color", value: emailHeaderColor, description: "Email header background color" },
      ];
      await Promise.all(settings.map((s) => upsertFirmSetting(s)));
      router.refresh();
      toast.success("Branding settings saved successfully");
    } catch {
      toast.error("Failed to save branding settings");
    } finally {
      setSaving(false);
    }
  }

  const displayName = firmName || siteConfig.name;
  const displayTagline = tagline || "Advocates & Legal Consultants";
  const selectedFont =
    FONT_OPTIONS.find((f) => f.value === fontFamily) ?? FONT_OPTIONS[0];

  const completionFields = [
    { label: "Logo", filled: !!logoUrl },
    { label: "Firm Name", filled: !!firmName },
    { label: "Tagline", filled: !!tagline },
    { label: "Email", filled: !!email },
    { label: "Phone", filled: !!phone },
    { label: "Address", filled: !!address },
    { label: "Colors", filled: primaryColor !== DEFAULTS.primaryColor },
    { label: "Invoice Footer", filled: !!invoiceFooter },
  ];

  /* ────────────────────────────────────────────────────────────── */
  /*                         Render                                 */
  /* ────────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs defaultValue="identity" className="w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-fit">
              <TabsTrigger value="identity" className="gap-1.5 text-xs sm:text-sm">
                <Building2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Identity</span>
              </TabsTrigger>
              <TabsTrigger value="colors" className="gap-1.5 text-xs sm:text-sm">
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Colors</span>
              </TabsTrigger>
              <TabsTrigger value="typography" className="gap-1.5 text-xs sm:text-sm">
                <Type className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Typography</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-xs sm:text-sm">
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-1.5 text-xs sm:text-sm">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={resetToDefaults}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset all colors to defaults</TooltipContent>
              </Tooltip>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Save Branding
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*                   IDENTITY TAB                         */}
          {/* ═══════════════════════════════════════════════════════ */}
          <TabsContent value="identity" className="mt-6 space-y-6">
            {/* Completion card */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardContent className="pt-6">
                <CompletionIndicator fields={completionFields} />
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* Logo Upload — wider */}
              <Card className="relative overflow-hidden lg:col-span-2">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10">
                        <ImageIcon className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Firm Logo</CardTitle>
                        <CardDescription className="text-xs">
                          PNG, SVG or JPG (max 2MB)
                        </CardDescription>
                      </div>
                    </div>
                    <SectionBadge variant="info">Recommended</SectionBadge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drop zone */}
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
                      logoUrl && !logoError ? "p-4" : "p-8",
                      dragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30",
                      uploading && "pointer-events-none opacity-60"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoUrl && !logoError ? (
                      <div className="relative group">
                        <div className="rounded-xl border bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md">
                          <Image
                            src={logoUrl}
                            alt="Firm logo"
                            width={140}
                            height={140}
                            className="h-24 w-24 rounded-lg object-contain"
                            onError={() => setLogoError(true)}
                            unoptimized
                          />
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogoUrl("");
                                setLogoError(false);
                                toast.info("Logo removed");
                              }}
                              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Remove logo</TooltipContent>
                        </Tooltip>
                        <p className="mt-3 text-center text-[11px] text-muted-foreground">
                          Click or drag to replace
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        {uploading ? (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Loader2 className="h-7 w-7 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-colors group-hover:bg-primary/10">
                            <Upload className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {uploading ? "Uploading..." : "Upload logo"}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Drag & drop or click to browse
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        or paste URL
                      </span>
                    </div>
                  </div>

                  <Input
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoError(false);
                      setLogoUrl(e.target.value);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="text-sm font-mono"
                  />
                </CardContent>
              </Card>

              {/* Firm Details — 3 cols */}
              <Card className="relative overflow-hidden lg:col-span-3">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Firm Details</CardTitle>
                      <CardDescription className="text-xs">
                        Name, tagline, and address used across the application
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="firmName" className="text-sm font-medium">
                        Firm Name
                      </Label>
                      <Input
                        id="firmName"
                        value={firmName}
                        onChange={(e) => setFirmName(e.target.value)}
                        placeholder="Enter firm name"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Displayed in sidebar, invoices, and emails.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tagline" className="text-sm font-medium">
                        Tagline / Slogan
                      </Label>
                      <Input
                        id="tagline"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Advocates & Legal Consultants"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Shown below your firm name in headers.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@yourfirm.co.ke"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="text-sm font-medium">
                        Website
                      </Label>
                      <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="www.yourfirm.co.ke"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Firm Address
                    </Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={"P.O. Box 12345-00100\nNairobi, Kenya"}
                      rows={3}
                      className="resize-none text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Used on invoices, letterheads, and email footers.
                    </p>
                  </div>

                  <Separator />

                  {/* Live mini-preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Live Preview
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                      style={{ backgroundColor: sidebarColor }}
                    >
                      {logoUrl && !logoError ? (
                        <Image
                          src={logoUrl}
                          alt="Logo"
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded-lg object-contain"
                          onError={() => setLogoError(true)}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Scale className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className="text-sm font-bold leading-tight truncate"
                          style={{ color: sidebarTextColor }}
                        >
                          {displayName}
                        </p>
                        {tagline && (
                          <p
                            className="text-[10px] leading-tight truncate opacity-60"
                            style={{ color: sidebarTextColor }}
                          >
                            {tagline}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*                    COLORS TAB                          */}
          {/* ═══════════════════════════════════════════════════════ */}
          <TabsContent value="colors" className="mt-6 space-y-6">
            {/* Presets */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Color Presets
                      </CardTitle>
                      <CardDescription className="text-xs">
                        One-click professional color schemes
                      </CardDescription>
                    </div>
                  </div>
                  <SectionBadge>Quick Apply</SectionBadge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {COLOR_PRESETS.map((preset) => {
                    const isActive =
                      primaryColor === preset.primary &&
                      sidebarColor === preset.sidebar;
                    return (
                      <Tooltip key={preset.name}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={cn(
                              "group relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-3 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                              isActive
                                ? "border-primary shadow-md ring-2 ring-primary/20"
                                : "border-transparent bg-muted/40 hover:border-muted-foreground/20"
                            )}
                          >
                            {/* Color strip preview */}
                            <div className="flex w-full overflow-hidden rounded-lg">
                              <div
                                className="h-10 flex-1"
                                style={{ backgroundColor: preset.sidebar }}
                              />
                              <div
                                className="h-10 w-4"
                                style={{ backgroundColor: preset.primary }}
                              />
                              <div
                                className="h-10 w-4"
                                style={{ backgroundColor: preset.accent }}
                              />
                            </div>
                            {/* Mini sidebar mockup */}
                            <div
                              className="w-full rounded-md px-1.5 py-1 space-y-0.5"
                              style={{ backgroundColor: preset.sidebar }}
                            >
                              {["", "", ""].map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "h-1 rounded-full",
                                    i === 0 ? "w-3/4" : i === 1 ? "w-1/2" : "w-2/3"
                                  )}
                                  style={{
                                    backgroundColor: preset.sidebarText,
                                    opacity: i === 0 ? 0.9 : 0.3,
                                  }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-semibold leading-tight text-center">
                              {preset.name}
                            </span>
                            {isActive && (
                              <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Apply {preset.name}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Custom Colors */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                      <Palette className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Brand Colors</CardTitle>
                      <CardDescription className="text-xs">
                        Used across buttons, links, and highlights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ColorField
                    id="primaryColor"
                    label="Primary Color"
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    description="Main brand color for headers, buttons, and key UI elements."
                  />
                  <Separator />
                  <ColorField
                    id="accentColor"
                    label="Accent Color"
                    value={accentColor}
                    onChange={setAccentColor}
                    description="Secondary color for links, active states, and highlights."
                  />
                  <Separator />
                  <ColorField
                    id="emailHeaderColor"
                    label="Email Header"
                    value={emailHeaderColor}
                    onChange={setEmailHeaderColor}
                    description="Background color for outgoing email headers."
                  />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                      <Monitor className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Sidebar Appearance
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Navigation sidebar background and text colors
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ColorField
                    id="sidebarColor"
                    label="Sidebar Background"
                    value={sidebarColor}
                    onChange={setSidebarColor}
                    description="Background color of the side navigation."
                  />
                  <Separator />
                  <ColorField
                    id="sidebarTextColor"
                    label="Sidebar Text"
                    value={sidebarTextColor}
                    onChange={setSidebarTextColor}
                    description="Color of text and icons in the sidebar."
                  />
                  <Separator />

                  {/* Inline sidebar preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Sidebar Preview
                      </span>
                    </div>
                    <div
                      className="rounded-xl p-3 space-y-1.5"
                      style={{ backgroundColor: sidebarColor }}
                    >
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                        <div
                          className="h-6 w-6 rounded flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Scale className="h-3 w-3 text-white" />
                        </div>
                        <span
                          className="text-xs font-bold truncate"
                          style={{ color: sidebarTextColor }}
                        >
                          {displayName}
                        </span>
                      </div>
                      {SIDEBAR_NAV_ITEMS.slice(0, 5).map((item) => (
                        <div
                          key={item.label}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition-colors",
                            item.active && "bg-white/10 font-medium"
                          )}
                          style={{
                            color: sidebarTextColor,
                            opacity: item.active ? 1 : 0.6,
                          }}
                        >
                          <item.icon className="h-3 w-3" />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Accessibility Tip</AlertTitle>
              <AlertDescription>
                Ensure sufficient contrast between sidebar background and text
                colors. A contrast ratio of at least 4.5:1 is recommended for
                readability.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*                  TYPOGRAPHY TAB                        */}
          {/* ═══════════════════════════════════════════════════════ */}
          <TabsContent value="typography" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="relative overflow-hidden lg:col-span-2">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Type className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Document Font</CardTitle>
                      <CardDescription className="text-xs">
                        Typeface for invoices, letters, and PDFs
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center justify-between gap-4">
                              <span style={{ fontFamily: opt.css }}>
                                {opt.label}
                              </span>
                              <Badge variant="outline" className="text-[9px] ml-2">
                                {opt.category}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle className="text-xs">Note</AlertTitle>
                    <AlertDescription className="text-xs">
                      This font is used only in generated documents (PDFs,
                      invoices). The application UI uses the system font.
                    </AlertDescription>
                  </Alert>

                  {/* Font samples */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      All Fonts
                    </span>
                    <div className="space-y-1.5">
                      {FONT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFontFamily(opt.value)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-all",
                            fontFamily === opt.value
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "hover:bg-muted/50"
                          )}
                        >
                          <span
                            className="text-sm"
                            style={{ fontFamily: opt.css }}
                          >
                            {opt.label}
                          </span>
                          {fontFamily === opt.value && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Typography preview */}
              <Card className="relative overflow-hidden lg:col-span-3">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                      <Eye className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Typography Preview
                      </CardTitle>
                      <CardDescription className="text-xs">
                        How text appears in your documents
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                    <div>
                      <p
                        className="text-2xl font-bold leading-tight"
                        style={{
                          fontFamily: selectedFont.css,
                          color: primaryColor,
                        }}
                      >
                        {displayName}
                      </p>
                      <p
                        className="text-sm mt-0.5"
                        style={{
                          fontFamily: selectedFont.css,
                          color: accentColor,
                        }}
                      >
                        {displayTagline}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p
                        className="text-lg font-semibold"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        Heading Example
                      </p>
                      <p
                        className="text-sm leading-relaxed text-gray-600"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        This is how body text will appear in your invoices,
                        letters, and official documents. The quick brown fox
                        jumps over the lazy dog. Legal proceedings require
                        clear, readable typography.
                      </p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p
                          className="text-xs uppercase tracking-wider text-gray-400 mb-1"
                          style={{ fontFamily: selectedFont.css }}
                        >
                          Invoice Number
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{ fontFamily: selectedFont.css }}
                        >
                          INV-2026-0042
                        </p>
                      </div>
                      <div>
                        <p
                          className="text-xs uppercase tracking-wider text-gray-400 mb-1"
                          style={{ fontFamily: selectedFont.css }}
                        >
                          Amount Due
                        </p>
                        <p
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: selectedFont.css,
                            color: primaryColor,
                          }}
                        >
                          KES 125,000.00
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*                  DOCUMENTS TAB                         */}
          {/* ═══════════════════════════════════════════════════════ */}
          <TabsContent value="documents" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Invoice Footer */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                      <FileText className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Invoice Footer
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Payment terms and legal disclaimers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="invoiceFooter" className="text-sm font-medium">
                      Footer Text
                    </Label>
                    <Textarea
                      id="invoiceFooter"
                      value={invoiceFooter}
                      onChange={(e) => setInvoiceFooter(e.target.value)}
                      placeholder={
                        "Payment is due within 30 days of invoice date.\nBank: ABC Bank | Account: 0123456789\nAll disputes subject to Nairobi jurisdiction."
                      }
                      rows={5}
                      className="resize-none text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Appears at the bottom of every invoice and quote PDF.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Email Preview */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Mail className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Email Preview
                      </CardTitle>
                      <CardDescription className="text-xs">
                        How outgoing emails appear to recipients
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border overflow-hidden shadow-sm">
                    {/* Email header */}
                    <div
                      className="px-5 py-4 flex items-center gap-3"
                      style={{ backgroundColor: emailHeaderColor }}
                    >
                      {logoUrl && !logoError ? (
                        <Image
                          src={logoUrl}
                          alt="Logo"
                          width={28}
                          height={28}
                          className="h-7 w-7 rounded object-contain"
                          onError={() => setLogoError(true)}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Scale className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-semibold text-white truncate">
                        {displayName}
                      </span>
                    </div>
                    {/* Body */}
                    <div className="p-5 space-y-3 bg-white">
                      <p
                        className="text-sm font-medium text-gray-900"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        Dear Client,
                      </p>
                      <p
                        className="text-xs text-gray-500 leading-relaxed"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        Please find attached your invoice for legal services
                        rendered. Should you have any questions regarding this
                        invoice, please do not hesitate to contact our office.
                      </p>
                      <div className="pt-1">
                        <div
                          className="inline-flex items-center rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm"
                          style={{ backgroundColor: accentColor }}
                        >
                          View Invoice
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </div>
                      </div>
                    </div>
                    {/* Footer */}
                    <div className="border-t px-5 py-3 bg-gray-50">
                      <p className="text-[10px] text-gray-400">
                        {displayName}
                        {phone && ` | ${phone}`}
                        {email && ` | ${email}`}
                        {address && ` | ${address.replace(/\n/g, ", ")}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice Header Preview */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                      <FileCheck className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Invoice Preview
                      </CardTitle>
                      <CardDescription className="text-xs">
                        How the top of your PDFs will look
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">PDF Output</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-white p-8 shadow-sm">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      {logoUrl && !logoError ? (
                        <Image
                          src={logoUrl}
                          alt="Logo"
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-xl object-contain shadow-sm"
                          onError={() => setLogoError(true)}
                          unoptimized
                        />
                      ) : (
                        <div
                          className="flex h-16 w-16 items-center justify-center rounded-xl shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Scale className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div>
                        <p
                          className="text-xl font-bold"
                          style={{
                            fontFamily: selectedFont.css,
                            color: primaryColor,
                          }}
                        >
                          {displayName}
                        </p>
                        {tagline && (
                          <p
                            className="text-xs text-gray-500 mt-0.5"
                            style={{ fontFamily: selectedFont.css }}
                          >
                            {tagline}
                          </p>
                        )}
                        {(address || email || phone) && (
                          <div
                            className="text-[11px] text-gray-400 mt-1.5 leading-relaxed space-y-0.5"
                            style={{ fontFamily: selectedFont.css }}
                          >
                            {address && (
                              <p className="whitespace-pre-line">{address}</p>
                            )}
                            {(email || phone) && (
                              <p>
                                {phone}
                                {phone && email && " | "}
                                {email}
                              </p>
                            )}
                            {website && <p>{website}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className="text-2xl font-bold uppercase tracking-wider"
                        style={{ color: primaryColor }}
                      >
                        Invoice
                      </p>
                      <div className="mt-2 space-y-0.5">
                        <p className="text-xs text-gray-400">
                          <span className="font-medium text-gray-500">No:</span>{" "}
                          INV-2026-0042
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium text-gray-500">
                            Date:
                          </span>{" "}
                          07 Mar 2026
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="font-medium text-gray-500">
                            Due:
                          </span>{" "}
                          06 Apr 2026
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-6 h-1 w-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                    }}
                  />

                  {/* Fake line items */}
                  <div className="mt-6 space-y-0">
                    <div className="grid grid-cols-12 gap-2 border-b pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-2 text-right">Hours</div>
                      <div className="col-span-2 text-right">Rate</div>
                      <div className="col-span-2 text-right">Amount</div>
                    </div>
                    {[
                      { desc: "Legal consultation", hrs: "4.0", rate: "15,000", amt: "60,000" },
                      { desc: "Court representation", hrs: "3.0", rate: "20,000", amt: "60,000" },
                      { desc: "Document preparation", hrs: "1.5", rate: "10,000", amt: "15,000" },
                    ].map((item) => (
                      <div
                        key={item.desc}
                        className="grid grid-cols-12 gap-2 border-b border-gray-100 py-2.5 text-xs text-gray-600"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        <div className="col-span-6">{item.desc}</div>
                        <div className="col-span-2 text-right">{item.hrs}</div>
                        <div className="col-span-2 text-right">
                          KES {item.rate}
                        </div>
                        <div className="col-span-2 text-right font-medium">
                          KES {item.amt}
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-3">
                      <div className="w-48 space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Subtotal</span>
                          <span>KES 135,000</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>VAT (16%)</span>
                          <span>KES 21,600</span>
                        </div>
                        <Separator />
                        <div
                          className="flex justify-between text-sm font-bold pt-1"
                          style={{ color: primaryColor }}
                        >
                          <span>Total</span>
                          <span>KES 156,600</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {invoiceFooter && (
                    <>
                      <Separator className="mt-6" />
                      <p
                        className="mt-3 text-[10px] text-gray-400 whitespace-pre-line leading-relaxed"
                        style={{ fontFamily: selectedFont.css }}
                      >
                        {invoiceFooter}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*                   PREVIEW TAB                          */}
          {/* ═══════════════════════════════════════════════════════ */}
          <TabsContent value="preview" className="mt-6 space-y-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                      <Eye className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Application Preview
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Full application shell with your branding applied
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                          <Switch
                            checked={showDarkPreview}
                            onCheckedChange={setShowDarkPreview}
                            size="sm"
                          />
                          <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Toggle dark content area
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* App shell mockup */}
                <div className="rounded-xl border overflow-hidden shadow-lg">
                  <div className="flex h-[480px]">
                    {/* ─── Sidebar ─── */}
                    <div
                      className="w-60 shrink-0 flex flex-col"
                      style={{ backgroundColor: sidebarColor }}
                    >
                      {/* Sidebar header */}
                      <div className="p-3.5 flex items-center gap-2.5 border-b border-white/10">
                        {logoUrl && !logoError ? (
                          <Image
                            src={logoUrl}
                            alt="Logo"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-lg object-contain"
                            onError={() => setLogoError(true)}
                            unoptimized
                          />
                        ) : (
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Scale className="h-4 w-4 text-white" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold leading-tight truncate"
                            style={{ color: sidebarTextColor }}
                          >
                            {displayName}
                          </p>
                          {tagline && (
                            <p
                              className="text-[9px] leading-tight truncate opacity-60"
                              style={{ color: sidebarTextColor }}
                            >
                              {tagline}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Branch selector mock */}
                      <div className="mx-3 mt-3 mb-2">
                        <div
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] border border-white/10"
                          style={{ color: sidebarTextColor }}
                        >
                          <Building2 className="h-3 w-3 opacity-60" />
                          <span className="opacity-80">
                            Main Office &mdash; Nairobi
                          </span>
                        </div>
                      </div>

                      {/* Nav items */}
                      <ScrollArea className="flex-1 px-2">
                        <div className="space-y-0.5 py-1">
                          {SIDEBAR_NAV_ITEMS.map((item) => (
                            <div
                              key={item.label}
                              className={cn(
                                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] transition-colors",
                                item.active && "bg-white/10 font-semibold"
                              )}
                              style={{
                                color: sidebarTextColor,
                                opacity: item.active ? 1 : 0.65,
                              }}
                            >
                              <item.icon className="h-3.5 w-3.5" />
                              {item.label}
                              {item.label === "Cases" && (
                                <span
                                  className="ml-auto text-[9px] rounded-full px-1.5 py-0.5"
                                  style={{
                                    backgroundColor: accentColor,
                                    color: "#fff",
                                  }}
                                >
                                  12
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Sidebar footer */}
                      <div className="p-3 border-t border-white/10 flex items-center gap-2.5">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                          style={{
                            backgroundColor: primaryColor,
                            color: "#fff",
                          }}
                        >
                          JK
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-semibold leading-tight truncate"
                            style={{ color: sidebarTextColor }}
                          >
                            John Kamau
                          </p>
                          <p
                            className="text-[9px] opacity-50 leading-tight"
                            style={{ color: sidebarTextColor }}
                          >
                            Admin
                          </p>
                        </div>
                        <Settings
                          className="ml-auto h-3.5 w-3.5 opacity-40"
                          style={{ color: sidebarTextColor }}
                        />
                      </div>
                    </div>

                    {/* ─── Main Area ─── */}
                    <div
                      className={cn(
                        "flex-1 flex flex-col transition-colors duration-300",
                        showDarkPreview ? "bg-gray-900" : "bg-gray-50"
                      )}
                    >
                      {/* Top bar */}
                      <div
                        className={cn(
                          "h-13 border-b px-5 flex items-center justify-between shrink-0",
                          showDarkPreview
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px]",
                              showDarkPreview
                                ? "bg-gray-700 text-gray-400"
                                : "bg-gray-100 text-gray-400"
                            )}
                          >
                            <Search className="h-3 w-3" />
                            Search...
                            <kbd
                              className={cn(
                                "ml-6 rounded px-1 py-0.5 text-[9px] font-mono",
                                showDarkPreview
                                  ? "bg-gray-600 text-gray-400"
                                  : "bg-gray-200 text-gray-400"
                              )}
                            >
                              Cmd+K
                            </kbd>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-7 w-7 rounded-full flex items-center justify-center",
                              showDarkPreview ? "bg-gray-700" : "bg-gray-100"
                            )}
                          >
                            <Bell
                              className={cn(
                                "h-3.5 w-3.5",
                                showDarkPreview
                                  ? "text-gray-400"
                                  : "text-gray-400"
                              )}
                            />
                          </div>
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            JK
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 overflow-hidden">
                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {[
                            { label: "Active Cases", val: "24", color: "blue" },
                            { label: "Clients", val: "86", color: "purple" },
                            {
                              label: "Revenue",
                              val: "KES 2.4M",
                              color: "emerald",
                            },
                            { label: "Pending", val: "7", color: "amber" },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className={cn(
                                "relative overflow-hidden rounded-xl border p-3",
                                showDarkPreview
                                  ? "bg-gray-800 border-gray-700"
                                  : "bg-white border-gray-200"
                              )}
                            >
                              <div
                                className="absolute inset-x-0 top-0 h-0.5"
                                style={{ backgroundColor: accentColor }}
                              />
                              <p
                                className={cn(
                                  "text-[9px] uppercase tracking-wider mb-1",
                                  showDarkPreview
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                )}
                              >
                                {stat.label}
                              </p>
                              <p
                                className="text-lg font-bold"
                                style={{ color: primaryColor }}
                              >
                                {stat.val}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Table mock */}
                        <div
                          className={cn(
                            "rounded-xl border flex-1",
                            showDarkPreview
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                          )}
                        >
                          <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
                            <p
                              className={cn(
                                "text-xs font-semibold",
                                showDarkPreview
                                  ? "text-gray-200"
                                  : "text-gray-700"
                              )}
                            >
                              Recent Cases
                            </p>
                            <div
                              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white cursor-pointer"
                              style={{ backgroundColor: accentColor }}
                            >
                              + New Case
                            </div>
                          </div>
                          <div className="divide-y divide-inherit">
                            {[
                              {
                                name: "Kamau v. ABC Corp",
                                status: "Active",
                                date: "07 Mar",
                              },
                              {
                                name: "Estate of Mwangi",
                                status: "Pending",
                                date: "05 Mar",
                              },
                              {
                                name: "Ochieng Land Dispute",
                                status: "Active",
                                date: "03 Mar",
                              },
                              {
                                name: "Njeri Employment Claim",
                                status: "Review",
                                date: "01 Mar",
                              },
                            ].map((c) => (
                              <div
                                key={c.name}
                                className="flex items-center justify-between px-4 py-2.5"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{ backgroundColor: accentColor }}
                                  />
                                  <span
                                    className={cn(
                                      "text-[11px]",
                                      showDarkPreview
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    )}
                                  >
                                    {c.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span
                                    className={cn(
                                      "text-[9px] px-2 py-0.5 rounded-full font-medium",
                                      c.status === "Active"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : c.status === "Pending"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-blue-100 text-blue-700"
                                    )}
                                  >
                                    {c.status}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[10px]",
                                      showDarkPreview
                                        ? "text-gray-500"
                                        : "text-gray-400"
                                    )}
                                  >
                                    {c.date}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Mobile sticky save bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm p-3 flex items-center justify-between gap-2 md:hidden">
        <Button variant="ghost" size="sm" onClick={resetToDefaults}>
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Save Branding
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
