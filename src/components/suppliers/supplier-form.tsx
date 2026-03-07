"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupplierSchema, type CreateSupplierInput } from "@/lib/validators/supplier";
import { createSupplier, updateSupplier } from "@/lib/actions/suppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AvatarUpload } from "@/components/ui/avatar-upload";

interface SupplierFormProps {
  defaultValues?: Partial<CreateSupplierInput>;
  supplierId?: string;
}

export function SupplierForm({ defaultValues, supplierId }: SupplierFormProps) {
  const router = useRouter();
  const isEditing = !!supplierId;

  const form = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      kraPin: "",
      bankName: "",
      bankAccountNumber: "",
      bankBranch: "",
      category: "",
      logoUrl: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: CreateSupplierInput) {
    try {
      const result = isEditing
        ? await updateSupplier(supplierId, data)
        : await createSupplier(data);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEditing ? "Supplier updated" : "Supplier created");
      router.push("/suppliers");
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
              currentUrl={form.watch("logoUrl") || null}
              fallbackText={form.watch("name")?.slice(0, 2)?.toUpperCase() || "SP"}
              onUpload={(url) => form.setValue("logoUrl", url)}
              onRemove={() => form.setValue("logoUrl", "")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" {...form.register("contactPerson")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register("address")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Stationery, IT, Legal services"
                {...form.register("category")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kraPin">KRA PIN</Label>
              <Input id="kraPin" {...form.register("kraPin")} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">Banking Details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" {...form.register("bankName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  {...form.register("bankAccountNumber")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBranch">Branch</Label>
                <Input id="bankBranch" {...form.register("bankBranch")} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Supplier"
                  : "Create Supplier"}
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
