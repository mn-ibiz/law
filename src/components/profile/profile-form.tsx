"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/actions/profile";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    createdAt: Date;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await updateProfile({ name, phone });

    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error as string });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully" });
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-1 capitalize text-xs">
              {user.role}
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Contact an administrator to change your email.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.type === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-1">Account Details</h3>
        <p className="text-sm text-muted-foreground">
          Member since {user.createdAt.toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}
