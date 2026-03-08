"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { updateOrganization } from "@/lib/actions/admin";

interface OrgEditFormProps {
  orgId: string;
  initialData: {
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export function OrgEditForm({ orgId, initialData }: OrgEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email ?? "");
  const [phone, setPhone] = useState(initialData.phone ?? "");
  const router = useRouter();

  async function handleSave() {
    setIsLoading(true);
    try {
      const result = await updateOrganization(orgId, {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Organization updated");
        setIsEditing(false);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
        <Pencil className="h-4 w-4 mr-1" /> Edit
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Edit Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name">Name</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-email">Email</Label>
          <Input
            id="org-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-phone">Phone</Label>
          <Input
            id="org-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isLoading} size="sm">
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
