import { notFound } from "next/navigation";
import Link from "next/link";
import { requireOrg } from "@/lib/auth/get-session";
import { getTrustAccountById, getTrustTransactions } from "@/lib/queries/trust";
import { formatKES } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionTypeBadge } from "@/components/shared/status-badges";
import { EmptyState } from "@/components/shared/empty-state";
import { TrustTransactionDialog } from "@/components/trust/trust-transaction-dialog";
import { TrustAccountEditDialog } from "@/components/trust/trust-account-edit-dialog";
import { ArrowLeft, Landmark, Receipt } from "lucide-react";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return { title: "Trust Account", description: "Trust account details" };
  }
  const { organizationId } = await requireOrg();
  const account = await getTrustAccountById(organizationId, id);
  return {
    title: account ? `${account.accountName} - Trust Account` : "Trust Account",
    description: account ? `Trust account details for ${account.accountName}` : "Trust account details",
  };
}

const accountTypeStyles: Record<string, string> = {
  client: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  general: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

export default async function TrustAccountDetailPage({ params }: PageProps) {
  const { organizationId } = await requireOrg();
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const account = await getTrustAccountById(organizationId, id);
  if (!account) notFound();

  const transactions = await getTrustTransactions(organizationId, id);
  const balance = Number(account.balance);

  // Compute running balance for display (transactions are ordered desc by date)
  // We need to compute from the earliest transaction forward, then display desc
  const transactionsWithRunning = transactions.reduce(
    (
      acc: {
        runningBalance: number;
        rows: Array<(typeof transactions)[number] & { runningBalance: number }>;
      },
      t
    ) => {
      const currentRunning = acc.runningBalance;
      const amt = Number(t.amount);
      const isCredit = ["deposit", "interest"].includes(t.type);
      // Since we're going backwards (newest first), we reverse the operation
      // to get what the balance was BEFORE this transaction
      const previousRunning = isCredit ? currentRunning - amt : currentRunning + amt;
      return {
        runningBalance: previousRunning,
        rows: [...acc.rows, { ...t, runningBalance: currentRunning }],
      };
    },
    {
      runningBalance: balance,
      rows: [] as Array<(typeof transactions)[number] & { runningBalance: number }>,
    }
  ).rows;

  return (
    <div className="space-y-6">
      <PageBreadcrumb
        items={[
          { label: "Trust Accounts", href: "/trust-accounts" },
          { label: account.accountName },
        ]}
      />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trust-accounts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{account.accountName}</h1>
            <p className="text-sm text-muted-foreground">
              {account.accountNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrustAccountEditDialog
            account={{
              id: account.id,
              accountName: account.accountName,
              type: account.type,
              bankName: account.bankName,
              branchName: account.branchName,
            }}
          />
          <TrustTransactionDialog
            accountId={id}
            type="deposit"
            currentBalance={balance}
          />
          <TrustTransactionDialog
            accountId={id}
            type="withdrawal"
            currentBalance={balance}
          />
        </div>
      </div>

      {/* Account Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</p>
            <p className={cn("mt-1 text-2xl font-bold", balance >= 0 ? "text-emerald-700" : "text-destructive")}>
              {formatKES(balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Account Type</p>
            <div className="mt-2">
              <span className={cn(capsule, accountTypeStyles[account.type] ?? accountTypeStyles.client)}>
                {formatEnum(account.type)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Client</p>
            <p className="mt-1 text-sm font-medium">{account.clientName}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bank</p>
            <p className="mt-1 text-sm font-medium">
              {account.bankName ?? "Not specified"}
              {account.branchName ? ` - ${account.branchName}` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsWithRunning.length === 0 ? (
            <EmptyState
              icon={Landmark}
              title="No transactions"
              description="This trust account has no transactions yet. Record a deposit or withdrawal to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">Balance</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reference</TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsWithRunning.map((t) => {
                    const amount = Number(t.amount);
                    const isCredit = ["deposit", "interest"].includes(t.type);
                    return (
                      <TableRow key={t.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString(APP_LOCALE, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <TransactionTypeBadge type={t.type} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                        <TableCell className={cn("text-right font-medium whitespace-nowrap", isCredit ? "text-emerald-700" : "text-destructive")}>
                          {isCredit ? "+" : "-"}{formatKES(amount)}
                        </TableCell>
                        <TableCell className="text-right font-medium whitespace-nowrap">
                          {formatKES(t.runningBalance)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{t.reference ?? "\u2014"}</TableCell>
                        <TableCell>{t.performedByName}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
