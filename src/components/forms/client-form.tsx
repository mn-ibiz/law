"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClientSchema, type CreateClientInput } from "@/lib/validators/client";
import { createClient, updateClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/ui/avatar-upload";

interface ClientFormProps {
  defaultValues?: Partial<CreateClientInput>;
  clientId?: string;
}

export function ClientForm({ defaultValues, clientId }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!clientId;

  const form = useForm<CreateClientInput>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      type: "individual",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      industry: "",
      taxId: "",
      nationalId: "",
      passportNumber: "",
      kraPin: "",
      county: "",
      poBox: "",
      physicalAddress: "",
      nextOfKin: "",
      employer: "",
      dateOfBirth: "",
      referralSource: "",
      notes: "",
      photoUrl: "",
      ...defaultValues,
    },
  });

  const clientType = form.watch("type");

  async function onSubmit(data: CreateClientInput) {
    try {
      const result = isEditing
        ? await updateClient(clientId, data)
        : await createClient(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Client updated" : "Client created");
      router.push("/clients");
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex justify-center">
            <AvatarUpload
              currentUrl={form.watch("photoUrl") || null}
              fallbackText={
                (form.watch("firstName")?.[0] ?? "") + (form.watch("lastName")?.[0] ?? "") || "CL"
              }
              onUpload={(url) => form.setValue("photoUrl", url)}
              onRemove={() => form.setValue("photoUrl", "")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Client Type *</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as "individual" | "organization")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {clientType === "organization" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" {...form.register("companyName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...form.register("industry")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID</Label>
                  <Input id="taxId" {...form.register("taxId")} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input id="nationalId" {...form.register("nationalId")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input id="passportNumber" {...form.register("passportNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kraPin">KRA PIN</Label>
              <Input id="kraPin" {...form.register("kraPin")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input id="county" placeholder="e.g. Nairobi" {...form.register("county")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poBox">P.O. Box</Label>
              <Input id="poBox" {...form.register("poBox")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Input id="physicalAddress" {...form.register("physicalAddress")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextOfKin">Next of Kin</Label>
              <Input id="nextOfKin" {...form.register("nextOfKin")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employer">Employer</Label>
              <Input id="employer" {...form.register("employer")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referralSource">Referral Source</Label>
              <Input id="referralSource" {...form.register("referralSource")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Client"
                  : "Create Client"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
