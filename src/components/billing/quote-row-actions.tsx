"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu, type RowAction } from "@/components/shared/row-actions-menu";
import { useAction } from "@/hooks/use-action";
import { updateQuoteStatus } from "@/lib/actions/billing";
import { Send, CheckCircle, XCircle, Clock } from "lucide-react";

interface QuoteRowActionsProps {
  quoteId: string;
  status: string;
  userRole: string;
}

export function QuoteRowActions({ quoteId, status, userRole }: QuoteRowActionsProps) {
  const router = useRouter();
  void userRole;

  const { execute: executeSend, isPending: isSending } = useAction(
    (id: string) => updateQuoteStatus(id, "sent"),
    { successMessage: "Quote sent", onSuccess: () => router.refresh() }
  );

  const { execute: executeAccept, isPending: isAccepting } = useAction(
    (id: string) => updateQuoteStatus(id, "accepted"),
    { successMessage: "Quote accepted", onSuccess: () => router.refresh() }
  );

  const { execute: executeReject, isPending: isRejecting } = useAction(
    (id: string) => updateQuoteStatus(id, "rejected"),
    { successMessage: "Quote rejected", onSuccess: () => router.refresh() }
  );

  const { execute: executeExpire, isPending: isExpiring } = useAction(
    (id: string) => updateQuoteStatus(id, "expired"),
    { successMessage: "Quote expired", onSuccess: () => router.refresh() }
  );

  const actions: RowAction[] = [];

  if (status === "draft") {
    actions.push({
      label: "Send Quote",
      icon: Send,
      onClick: () => executeSend(quoteId),
      disabled: isSending,
    });
  }

  if (status === "sent") {
    actions.push({
      label: "Mark Accepted",
      icon: CheckCircle,
      onClick: () => executeAccept(quoteId),
      disabled: isAccepting,
    });
    actions.push({
      label: "Mark Rejected",
      icon: XCircle,
      onClick: () => executeReject(quoteId),
      disabled: isRejecting,
    });
    actions.push({
      label: "Mark Expired",
      icon: Clock,
      onClick: () => executeExpire(quoteId),
      disabled: isExpiring,
    });
  }

  return <RowActionsMenu actions={actions} />;
}
