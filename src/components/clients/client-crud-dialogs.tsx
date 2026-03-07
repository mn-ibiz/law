"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  addContactLog,
  updateContactLog,
  deleteContactLog,
  addKycDocument,
  updateKycDocument,
  deleteKycDocument,
  addRiskAssessment,
  updateRiskAssessment,
  deleteRiskAssessment,
} from "@/lib/actions/clients";

// ── Contact Log Dialogs ──

interface ContactLog {
  id: string;
  type: string;
  subject: string;
  notes: string | null;
  contactDate: Date;
}

export function AddContactLogDialog({
  clientId,
  existing,
}: {
  clientId: string;
  existing?: ContactLog;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      type: fd.get("type") as string,
      subject: fd.get("subject") as string,
      notes: (fd.get("notes") as string) || undefined,
      contactDate: fd.get("contactDate") as string,
    };

    startTransition(async () => {
      const result = existing
        ? await updateContactLog(existing.id, clientId, data)
        : await addContactLog(clientId, data);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(existing ? "Contact log updated" : "Contact log added");
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={existing ? "ghost" : "outline"} size={existing ? "icon" : "default"} onClick={() => setOpen(true)}>
        {existing ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" />Add Contact</>}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Contact Log" : "Add Contact Log"}</DialogTitle>
          <DialogDescription>Record a client interaction.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clType">Type</Label>
            <Select name="type" defaultValue={existing?.type ?? "phone_call"}>
              <SelectTrigger id="clType"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone_call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clSubject">Subject</Label>
            <Input id="clSubject" name="subject" defaultValue={existing?.subject ?? ""} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clDate">Date</Label>
            <Input
              id="clDate"
              name="contactDate"
              type="date"
              defaultValue={existing ? new Date(existing.contactDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clNotes">Notes</Label>
            <Textarea id="clNotes" name="notes" defaultValue={existing?.notes ?? ""} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteContactLogButton({ contactId, clientId }: { contactId: string; clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact Log</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteContactLog(contactId, clientId);
                if (result?.error) toast.error(result.error);
                else { toast.success("Contact log deleted"); router.refresh(); }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── KYC Document Dialogs ──

interface KycDocument {
  id: string;
  documentType: string;
  documentNumber: string | null;
  status: string;
  expiryDate: Date | null;
}

export function AddKycDocumentDialog({
  clientId,
  existing,
}: {
  clientId: string;
  existing?: KycDocument;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (existing) {
      const data = {
        documentType: fd.get("documentType") as string,
        documentNumber: (fd.get("documentNumber") as string) || undefined,
        status: fd.get("status") as string,
        expiryDate: (fd.get("expiryDate") as string) || undefined,
      };
      startTransition(async () => {
        const result = await updateKycDocument(existing.id, clientId, data);
        if (result?.error) toast.error(result.error);
        else { toast.success("KYC document updated"); setOpen(false); router.refresh(); }
      });
    } else {
      const data = {
        documentType: fd.get("documentType") as string,
        documentNumber: (fd.get("documentNumber") as string) || undefined,
        expiryDate: (fd.get("expiryDate") as string) || undefined,
      };
      startTransition(async () => {
        const result = await addKycDocument(clientId, data);
        if (result?.error) toast.error(result.error);
        else { toast.success("KYC document added"); setOpen(false); router.refresh(); }
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={existing ? "ghost" : "outline"} size={existing ? "icon" : "default"} onClick={() => setOpen(true)}>
        {existing ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" />Add Document</>}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit KYC Document" : "Add KYC Document"}</DialogTitle>
          <DialogDescription>Manage client KYC documentation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kycType">Document Type</Label>
            <Select name="documentType" defaultValue={existing?.documentType ?? "national_id"}>
              <SelectTrigger id="kycType"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="kra_pin">KRA PIN</SelectItem>
                <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                <SelectItem value="company_registration">Company Registration</SelectItem>
                <SelectItem value="tax_compliance">Tax Compliance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kycNumber">Document Number</Label>
            <Input id="kycNumber" name="documentNumber" defaultValue={existing?.documentNumber ?? ""} />
          </div>
          {existing && (
            <div className="space-y-2">
              <Label htmlFor="kycStatus">Status</Label>
              <Select name="status" defaultValue={existing.status}>
                <SelectTrigger id="kycStatus"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="kycExpiry">Expiry Date</Label>
            <Input
              id="kycExpiry"
              name="expiryDate"
              type="date"
              defaultValue={existing?.expiryDate ? new Date(existing.expiryDate).toISOString().split("T")[0] : ""}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteKycDocumentButton({ docId, clientId }: { docId: string; clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete KYC Document</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteKycDocument(docId, clientId);
                if (result?.error) toast.error(result.error);
                else { toast.success("KYC document deleted"); router.refresh(); }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Risk Assessment Dialogs ──

interface RiskAssessment {
  id: string;
  riskLevel: string;
  factors: string | null;
  notes: string | null;
}

export function AddRiskAssessmentDialog({
  clientId,
  existing,
}: {
  clientId: string;
  existing?: RiskAssessment;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      riskLevel: fd.get("riskLevel") as string,
      factors: (fd.get("factors") as string) || undefined,
      notes: (fd.get("notes") as string) || undefined,
    };

    startTransition(async () => {
      const result = existing
        ? await updateRiskAssessment(existing.id, clientId, data)
        : await addRiskAssessment(clientId, data);
      if (result?.error) toast.error(result.error);
      else { toast.success(existing ? "Risk assessment updated" : "Risk assessment added"); setOpen(false); router.refresh(); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={existing ? "outline" : "default"} size="default" onClick={() => setOpen(true)}>
        {existing ? <><Pencil className="mr-2 h-4 w-4" />Edit Assessment</> : <><Plus className="mr-2 h-4 w-4" />Perform Assessment</>}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit Risk Assessment" : "Perform Risk Assessment"}</DialogTitle>
          <DialogDescription>Assess the risk level for this client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="raLevel">Risk Level</Label>
            <Select name="riskLevel" defaultValue={existing?.riskLevel ?? "low"}>
              <SelectTrigger id="raLevel"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="raFactors">Risk Factors</Label>
            <Textarea id="raFactors" name="factors" defaultValue={existing?.factors ?? ""} rows={3} placeholder="List risk factors..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="raNotes">Notes</Label>
            <Textarea id="raNotes" name="notes" defaultValue={existing?.notes ?? ""} rows={3} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRiskAssessmentButton({ assessmentId, clientId }: { assessmentId: string; clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="default"><Trash2 className="mr-2 h-4 w-4 text-destructive" />Delete Assessment</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Risk Assessment</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteRiskAssessment(assessmentId, clientId);
                if (result?.error) toast.error(result.error);
                else { toast.success("Risk assessment deleted"); router.refresh(); }
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
