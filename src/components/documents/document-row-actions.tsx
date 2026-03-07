"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RowActionsMenu, type RowAction } from "@/components/shared/row-actions-menu";
import { StatusUpdateDropdown } from "@/components/shared/status-update-dropdown";
import { useAction } from "@/hooks/use-action";
import { updateDocumentStatus, deleteDocument } from "@/lib/actions/documents";
import { FileCheck, Download, Pencil } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { DocumentEditDialog } from "@/components/documents/document-edit-dialog";

const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "final", label: "Final" },
  { value: "signed", label: "Signed" },
  { value: "archived", label: "Archived" },
];

interface DocumentRowActionsProps {
  documentId: string;
  status: string;
  fileUrl?: string | null;
  title: string;
  category: string;
  description?: string | null;
  caseId?: string | null;
  clientId?: string | null;
  cases: { id: string; caseNumber: string; title: string }[];
  clients: { id: string; name: string }[];
}

export function DocumentRowActions({
  documentId,
  status,
  fileUrl,
  title,
  category,
  description,
  caseId,
  clientId,
  cases,
  clients,
}: DocumentRowActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const { execute: executeStatusUpdate, isPending: isUpdatingStatus } = useAction(
    (input: { id: string; status: string }) =>
      updateDocumentStatus(input.id, input.status as "draft" | "final" | "signed" | "archived"),
    {
      successMessage: "Document status updated",
      onSuccess: () => router.refresh(),
    }
  );

  const { execute: executeDelete, isPending: isDeleting } = useAction(deleteDocument, {
    successMessage: "Document deleted",
    onSuccess: () => {
      setShowDelete(false);
      router.refresh();
    },
  });

  const actions: RowAction[] = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: () => setShowEdit(true),
    },
    ...(fileUrl
      ? [
          {
            label: "Download",
            icon: Download,
            onClick: () => {
              const link = document.createElement("a");
              link.href = fileUrl;
              link.download = "";
              link.click();
            },
          } satisfies RowAction,
        ]
      : []),
    {
      label: "Change Status",
      icon: FileCheck,
      onClick: () => setShowStatusDropdown((v) => !v),
    },
  ];

  return (
    <div className="flex items-center gap-1">
      {showStatusDropdown && (
        <StatusUpdateDropdown
          currentStatus={status}
          options={DOCUMENT_STATUSES}
          onSelect={(newStatus) => {
            executeStatusUpdate({ id: documentId, status: newStatus });
            setShowStatusDropdown(false);
          }}
          isPending={isUpdatingStatus}
          label="Change document status"
        />
      )}

      <RowActionsMenu
        actions={actions}
        onDelete={() => setShowDelete(true)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => executeDelete(documentId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner className="h-4 w-4 mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <DocumentEditDialog
        open={showEdit}
        onOpenChange={setShowEdit}
        document={{
          id: documentId,
          title,
          category,
          description,
          caseId,
          clientId,
        }}
        cases={cases}
        clients={clients}
      />
    </div>
  );
}
