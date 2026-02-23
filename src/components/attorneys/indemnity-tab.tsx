"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { addProfessionalIndemnity } from "@/lib/actions/attorneys";

interface IndemnityRecord {
  id: string;
  attorneyId: string;
  insurer: string;
  policyNumber: string;
  coverageAmount: string;
  premium: string | null;
  startDate: Date;
  expiryDate: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  expired: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  cancelled: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

export function IndemnityTab({
  attorneyId,
  records,
}: {
  attorneyId: string;
  records: IndemnityRecord[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [insurer, setInsurer] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [premium, setPremium] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState<string>("active");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setInsurer("");
    setPolicyNumber("");
    setCoverageAmount("");
    setPremium("");
    setStartDate("");
    setExpiryDate("");
    setStatus("active");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await addProfessionalIndemnity(attorneyId, {
        insurer,
        policyNumber,
        coverageAmount: Number(coverageAmount),
        premium: premium ? Number(premium) : undefined,
        startDate,
        expiryDate,
        status,
        notes: notes || undefined,
      });

      if ("error" in result && result.error) {
        toast.error(result.error as string);
        return;
      }

      toast.success("Insurance record added");
      resetForm();
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Professional Indemnity Insurance</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Insurance Policy</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="insurer">Insurer *</Label>
                    <Input
                      id="insurer"
                      value={insurer}
                      onChange={(e) => setInsurer(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyNumber">Policy Number *</Label>
                    <Input
                      id="policyNumber"
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Coverage Amount (KES) *</Label>
                    <Input
                      id="coverageAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="premium">Premium (KES)</Label>
                    <Input
                      id="premium"
                      type="number"
                      step="0.01"
                      min="0"
                      value={premium}
                      onChange={(e) => setPremium(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Add Policy"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No insurance records found. Click &ldquo;Add Policy&rdquo; to add one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Insurer</TableHead>
                  <TableHead>Policy No.</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>Premium</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.insurer}</TableCell>
                    <TableCell>{record.policyNumber}</TableCell>
                    <TableCell>{formatKES(Number(record.coverageAmount))}</TableCell>
                    <TableCell>
                      {record.premium ? formatKES(Number(record.premium)) : "\u2014"}
                    </TableCell>
                    <TableCell>
                      {new Date(record.startDate).toLocaleDateString(APP_LOCALE)} &ndash;{" "}
                      {new Date(record.expiryDate).toLocaleDateString(APP_LOCALE)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${capsule} ${statusStyles[record.status] ?? statusStyles.active}`}
                      >
                        {formatEnum(record.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
