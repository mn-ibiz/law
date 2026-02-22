"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publicIntakeSchema, type PublicIntakeInput } from "@/lib/validators/intake";
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
import { submitIntake } from "@/lib/actions/intake";

export function PublicIntakeForm() {
  const router = useRouter();

  const form = useForm<PublicIntakeInput>({
    resolver: zodResolver(publicIntakeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      caseType: "",
      description: "",
      referralSource: "",
      consentDataProtection: false,
      consentTerms: false,
    },
  });

  async function onSubmit(data: PublicIntakeInput) {
    const result = await submitIntake(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Intake form submitted successfully");
    router.push("/intake/success");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div className="space-y-2">
            <Label>Case Type *</Label>
            <Select
              value={form.watch("caseType")}
              onValueChange={(val) => form.setValue("caseType", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select case type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="civil_litigation">Civil Litigation</SelectItem>
                <SelectItem value="criminal_defense">Criminal Defense</SelectItem>
                <SelectItem value="family_law">Family Law</SelectItem>
                <SelectItem value="property_law">Property / Conveyancing</SelectItem>
                <SelectItem value="commercial_law">Commercial Law</SelectItem>
                <SelectItem value="employment_law">Employment Law</SelectItem>
                <SelectItem value="personal_injury">Personal Injury</SelectItem>
                <SelectItem value="immigration">Immigration</SelectItem>
                <SelectItem value="tax_law">Tax Law</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.caseType && (
              <p className="text-sm text-destructive">{form.formState.errors.caseType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Please describe your legal matter..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralSource">How did you hear about us?</Label>
            <Input id="referralSource" {...form.register("referralSource")} />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="consentDataProtection"
                checked={form.watch("consentDataProtection")}
                onCheckedChange={(checked) =>
                  form.setValue("consentDataProtection", checked === true)
                }
              />
              <div>
                <Label htmlFor="consentDataProtection" className="text-sm font-normal">
                  I consent to the processing of my personal data in accordance with the
                  Kenya Data Protection Act, 2019. *
                </Label>
                {form.formState.errors.consentDataProtection && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.consentDataProtection.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="consentTerms"
                checked={form.watch("consentTerms")}
                onCheckedChange={(checked) =>
                  form.setValue("consentTerms", checked === true)
                }
              />
              <div>
                <Label htmlFor="consentTerms" className="text-sm font-normal">
                  I accept the terms of engagement and understand that submitting this form
                  does not create an advocate-client relationship. *
                </Label>
                {form.formState.errors.consentTerms && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.consentTerms.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting ? "Submitting..." : "Submit Intake Form"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
