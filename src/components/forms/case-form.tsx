"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCaseSchema, type CreateCaseInput } from "@/lib/validators/case";
import { createCase, updateCase } from "@/lib/actions/cases";
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

interface CaseFormProps {
  defaultValues?: Partial<CreateCaseInput>;
  caseId?: string;
  clients: { id: string; name: string }[];
}

export function CaseForm({ defaultValues, caseId, clients }: CaseFormProps) {
  const router = useRouter();
  const isEditing = !!caseId;

  const form = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: "",
      clientId: "",
      caseType: "",
      practiceArea: "",
      priority: "medium",
      billingType: "hourly",
      hourlyRate: undefined,
      flatFeeAmount: undefined,
      contingencyPercentage: undefined,
      courtName: "",
      courtCaseNumber: "",
      judge: "",
      opposingCounsel: "",
      opposingParty: "",
      description: "",
      notes: "",
      ...defaultValues,
    },
  });

  const billingType = form.watch("billingType");

  async function onSubmit(data: CreateCaseInput) {
    const result = isEditing
      ? await updateCase(caseId, data)
      : await createCase(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Case updated" : "Case created");
    router.push("/cases");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Client *</Label>
              <Select
                value={form.watch("clientId")}
                onValueChange={(val) => form.setValue("clientId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.clientId && (
                <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Case Type *</Label>
              <Select
                value={form.watch("caseType")}
                onValueChange={(val) => form.setValue("caseType", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
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
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(val) => form.setValue("priority", val as CreateCaseInput["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Billing Type</Label>
              <Select
                value={form.watch("billingType")}
                onValueChange={(val) => form.setValue("billingType", val as CreateCaseInput["billingType"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="flat_fee">Flat Fee</SelectItem>
                  <SelectItem value="contingency">Contingency</SelectItem>
                  <SelectItem value="retainer">Retainer</SelectItem>
                  <SelectItem value="pro_bono">Pro Bono</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {billingType === "hourly" && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (KES)</Label>
                <Input id="hourlyRate" type="number" step="100" {...form.register("hourlyRate", { valueAsNumber: true })} />
              </div>
            )}
            {billingType === "flat_fee" && (
              <div className="space-y-2">
                <Label htmlFor="flatFeeAmount">Flat Fee (KES)</Label>
                <Input id="flatFeeAmount" type="number" step="100" {...form.register("flatFeeAmount", { valueAsNumber: true })} />
              </div>
            )}
            {billingType === "contingency" && (
              <div className="space-y-2">
                <Label htmlFor="contingencyPercentage">Contingency %</Label>
                <Input id="contingencyPercentage" type="number" step="0.5" {...form.register("contingencyPercentage", { valueAsNumber: true })} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="practiceArea">Practice Area</Label>
              <Input id="practiceArea" {...form.register("practiceArea")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courtName">Court Name</Label>
              <Input id="courtName" {...form.register("courtName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="courtCaseNumber">Court Case Number</Label>
              <Input id="courtCaseNumber" {...form.register("courtCaseNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="judge">Judge</Label>
              <Input id="judge" {...form.register("judge")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opposingParty">Opposing Party</Label>
              <Input id="opposingParty" {...form.register("opposingParty")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="opposingCounsel">Opposing Counsel</Label>
              <Input id="opposingCounsel" {...form.register("opposingCounsel")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFiled">Date Filed</Label>
              <Input id="dateFiled" type="date" {...form.register("dateFiled")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value (KES)</Label>
              <Input id="estimatedValue" type="number" step="1000" {...form.register("estimatedValue", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...form.register("notes")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Case"
                  : "Create Case"}
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
