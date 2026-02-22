"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAttorneySchema, type CreateAttorneyInput } from "@/lib/validators/attorney";
import { createAttorney, updateAttorney } from "@/lib/actions/attorneys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

interface AttorneyFormProps {
  defaultValues?: Partial<CreateAttorneyInput>;
  attorneyId?: string;
  users?: UserOption[];
}

export function AttorneyForm({ defaultValues, attorneyId, users }: AttorneyFormProps) {
  const router = useRouter();
  const isEditing = !!attorneyId;

  const form = useForm<CreateAttorneyInput>({
    resolver: zodResolver(createAttorneySchema),
    defaultValues: {
      userId: "",
      barNumber: "",
      jurisdiction: "Kenya",
      title: "associate",
      department: "",
      hourlyRate: 0,
      bio: "",
      lskNumber: "",
      commissionerForOaths: false,
      notaryPublic: false,
      seniorCounsel: false,
      ...defaultValues,
    },
  });

  async function onSubmit(data: CreateAttorneyInput) {
    try {
      const result = isEditing
        ? await updateAttorney(attorneyId, data)
        : await createAttorney(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Attorney updated" : "Attorney created");
      router.push("/attorneys");
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="userId">User Account *</Label>
                {users && users.length > 0 ? (
                  <Select
                    value={form.watch("userId")}
                    onValueChange={(val) => form.setValue("userId", val, { shouldValidate: true })}
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="Select a user account" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name ?? u.email} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="userId"
                    placeholder="Enter user account UUID"
                    {...form.register("userId")}
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  The user account to link this attorney profile to.
                </p>
                {form.formState.errors.userId && (
                  <p className="text-sm text-destructive">{form.formState.errors.userId.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="barNumber">Bar Number *</Label>
              <Input id="barNumber" {...form.register("barNumber")} />
              {form.formState.errors.barNumber && (
                <p className="text-sm text-destructive">{form.formState.errors.barNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Jurisdiction *</Label>
              <Input id="jurisdiction" {...form.register("jurisdiction")} />
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Select
                value={form.watch("title")}
                onValueChange={(val) => form.setValue("title", val as CreateAttorneyInput["title"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="senior_associate">Senior Associate</SelectItem>
                  <SelectItem value="associate">Associate</SelectItem>
                  <SelectItem value="of_counsel">Of Counsel</SelectItem>
                  <SelectItem value="paralegal">Paralegal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate (KES)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="100"
                {...form.register("hourlyRate", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateAdmitted">Date Admitted to Bar</Label>
              <Input
                id="dateAdmitted"
                type="date"
                {...form.register("dateAdmitted")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lskNumber">LSK Number</Label>
              <Input id="lskNumber" {...form.register("lskNumber")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} {...form.register("bio")} />
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="commissionerForOaths"
                checked={form.watch("commissionerForOaths")}
                onCheckedChange={(checked) =>
                  form.setValue("commissionerForOaths", checked === true)
                }
              />
              <Label htmlFor="commissionerForOaths">Commissioner for Oaths</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="notaryPublic"
                checked={form.watch("notaryPublic")}
                onCheckedChange={(checked) =>
                  form.setValue("notaryPublic", checked === true)
                }
              />
              <Label htmlFor="notaryPublic">Notary Public</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="seniorCounsel"
                checked={form.watch("seniorCounsel")}
                onCheckedChange={(checked) =>
                  form.setValue("seniorCounsel", checked === true)
                }
              />
              <Label htmlFor="seniorCounsel">Senior Counsel</Label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Attorney"
                  : "Create Attorney"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
