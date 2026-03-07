"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createQuoteWithLineItemsSchema, type CreateQuoteWithLineItemsInput } from "@/lib/validators/billing";
import { createQuoteWithLineItems } from "@/lib/actions/billing";
import { APP_LOCALE } from "@/lib/constants/locale";
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
import { Plus, Trash2 } from "lucide-react";

interface QuoteFormProps {
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function QuoteForm({ cases, clients }: QuoteFormProps) {
  const router = useRouter();

  const form = useForm<CreateQuoteWithLineItemsInput>({
    resolver: zodResolver(createQuoteWithLineItemsSchema),
    defaultValues: {
      caseId: undefined,
      clientId: "",
      validUntil: "",
      notes: "",
      lineItems: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const watchLineItems = form.watch("lineItems");

  function updateLineItemAmount(index: number) {
    const quantity = form.getValues(`lineItems.${index}.quantity`) || 0;
    const rate = form.getValues(`lineItems.${index}.rate`) || 0;
    form.setValue(`lineItems.${index}.amount`, quantity * rate);
  }

  const subtotal = watchLineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const vatAmount = subtotal * 0.16;
  const total = subtotal + vatAmount;

  async function onSubmit(data: CreateQuoteWithLineItemsInput) {
    try {
      const dataWithAmounts = {
        ...data,
        lineItems: data.lineItems.map((item) => ({
          ...item,
          amount: item.quantity * item.rate,
        })),
      };

      const result = await createQuoteWithLineItems(dataWithAmounts);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Quote created");
      router.push("/billing/quotes");
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label>Case (optional)</Label>
              <Select
                value={form.watch("caseId") ?? ""}
                onValueChange={(val) => form.setValue("caseId", val || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until *</Label>
              <Input id="validUntil" type="date" {...form.register("validUntil")} />
              {form.formState.errors.validUntil && (
                <p className="text-sm text-destructive">{form.formState.errors.validUntil.message}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Line Items *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", quantity: 1, rate: 0, amount: 0 })}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Item
              </Button>
            </div>

            {form.formState.errors.lineItems?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.lineItems.root.message}</p>
            )}

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`lineItems.${index}.description`}>Description *</Label>
                  <Input
                    id={`lineItems.${index}.description`}
                    {...form.register(`lineItems.${index}.description`)}
                    placeholder="Service description"
                  />
                  {form.formState.errors.lineItems?.[index]?.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.lineItems[index].description?.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`lineItems.${index}.quantity`}>Quantity</Label>
                    <Input
                      id={`lineItems.${index}.quantity`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...form.register(`lineItems.${index}.quantity`, {
                        valueAsNumber: true,
                        onChange: () => updateLineItemAmount(index),
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`lineItems.${index}.rate`}>Rate (KES)</Label>
                    <Input
                      id={`lineItems.${index}.rate`}
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register(`lineItems.${index}.rate`, {
                        valueAsNumber: true,
                        onChange: () => updateLineItemAmount(index),
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (KES)</Label>
                    <Input
                      readOnly
                      value={(watchLineItems[index]?.amount || 0).toLocaleString(APP_LOCALE, {
                        minimumFractionDigits: 2,
                      })}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString(APP_LOCALE, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (16%)</span>
              <span>KES {vatAmount.toLocaleString(APP_LOCALE, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>KES {total.toLocaleString(APP_LOCALE, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...form.register("notes")} placeholder="Additional notes (optional)" />
            {form.formState.errors.notes && (
              <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create Quote"}
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
