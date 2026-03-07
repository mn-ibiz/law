import Link from "next/link";
import { Pencil, Receipt, CalendarClock, AlertCircle, CheckCircle2, ListTodo } from "lucide-react";
import { ArchiveCaseButton } from "@/components/cases/archive-case-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CaseStatusBadge, PriorityBadge } from "@/components/shared/status-badges";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatKES, formatRelativeDate } from "@/lib/utils/format";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";

interface Assignment {
  id: string;
  role: string;
  userName: string | null;
  userAvatar: string | null;
}

interface Deadline {
  id: string;
  title: string;
  priority: string;
  dueDate: Date;
  completedAt: Date | null;
  isStatutory: boolean;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
}

interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  priority: string;
  caseType: string;
  practiceArea: string | null;
  billingType: string;
  hourlyRate: string | null;
  flatFeeAmount: string | null;
  contingencyPercentage: string | null;
  estimatedValue: string | null;
  dateFiled: Date | null;
  statuteOfLimitations: Date | null;
  clientId: string;
  clientName: string;
  createdAt: Date;
}

interface CaseSummarySidebarProps {
  caseData: CaseData;
  assignments: Assignment[];
  deadlines?: Deadline[];
  tasks?: Task[];
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right truncate">{children}</span>
    </div>
  );
}

function billingAmount(caseData: CaseData): string | null {
  if (caseData.hourlyRate) return `${formatKES(Number(caseData.hourlyRate))}/hr`;
  if (caseData.flatFeeAmount) return formatKES(Number(caseData.flatFeeAmount));
  if (caseData.contingencyPercentage) return `${caseData.contingencyPercentage}%`;
  return null;
}

export function CaseSummarySidebar({ caseData, assignments, deadlines = [], tasks = [] }: CaseSummarySidebarProps) {
  const amount = billingAmount(caseData);

  // Upcoming deadlines (incomplete, sorted by due date, max 3)
  const upcomingDeadlines = deadlines
    .filter((d) => !d.completedAt)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  // Active tasks (not completed/cancelled, max 3)
  const activeTasks = tasks
    .filter((t) => t.status !== "completed" && t.status !== "cancelled")
    .slice(0, 3);

  // Statute of limitations progress
  const hasStatute = !!caseData.statuteOfLimitations && !!caseData.dateFiled;
  let statutePct = 0;
  let statuteDaysLeft = 0;
  if (hasStatute) {
    const filed = new Date(caseData.dateFiled!).getTime();
    const limit = new Date(caseData.statuteOfLimitations!).getTime();
    const now = Date.now();
    const total = limit - filed;
    const elapsed = now - filed;
    statutePct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100;
    statuteDaysLeft = Math.ceil((limit - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="space-y-4">
      <Card className="sticky top-6">
        <CardContent className="p-5 space-y-4">
          {/* Status & Priority */}
          <div className="flex items-center gap-2 flex-wrap">
            <CaseStatusBadge status={caseData.status} />
            <PriorityBadge priority={caseData.priority} />
          </div>

          <Separator />

          {/* Key Info */}
          <div className="space-y-2.5">
            <InfoRow label="Client">
              <Link href={`/clients/${caseData.clientId}`} className="text-primary hover:underline">
                {caseData.clientName}
              </Link>
            </InfoRow>
            <InfoRow label="Case #">
              <span className="font-mono text-xs">{caseData.caseNumber}</span>
            </InfoRow>
            <InfoRow label="Type">{formatEnum(caseData.caseType)}</InfoRow>
            {caseData.practiceArea && (
              <InfoRow label="Practice Area">{caseData.practiceArea}</InfoRow>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-2.5">
            {caseData.dateFiled && (
              <InfoRow label="Filed">
                {new Date(caseData.dateFiled).toLocaleDateString(APP_LOCALE)}
              </InfoRow>
            )}
            {caseData.createdAt && (
              <InfoRow label="Created">
                {new Date(caseData.createdAt).toLocaleDateString(APP_LOCALE)}
              </InfoRow>
            )}
            {caseData.statuteOfLimitations && (
              <InfoRow label="Limitation">
                <span className={statuteDaysLeft < 30 ? "text-destructive font-semibold" : ""}>
                  {new Date(caseData.statuteOfLimitations).toLocaleDateString(APP_LOCALE)}
                </span>
              </InfoRow>
            )}
          </div>

          {/* Statute of Limitations Progress */}
          {hasStatute && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Time elapsed</span>
                <span className={`text-[10px] font-medium ${statuteDaysLeft < 30 ? "text-destructive" : "text-muted-foreground"}`}>
                  {statuteDaysLeft > 0 ? `${statuteDaysLeft} days left` : "Expired"}
                </span>
              </div>
              <Progress
                value={statutePct}
                className={`h-1.5 ${statutePct > 80 ? "[&>div]:bg-destructive" : statutePct > 60 ? "[&>div]:bg-amber-500" : ""}`}
              />
            </div>
          )}

          <Separator />

          {/* Billing */}
          <div className="space-y-2.5">
            <InfoRow label="Billing">{formatEnum(caseData.billingType)}</InfoRow>
            {amount && <InfoRow label="Amount">{amount}</InfoRow>}
            {caseData.estimatedValue && (
              <InfoRow label="Est. Value">
                {formatKES(Number(caseData.estimatedValue))}
              </InfoRow>
            )}
          </div>

          {/* Team */}
          {assignments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Team
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 rounded-full bg-muted px-2.5 py-1"
                    >
                      <PersonAvatar name={a.userName} imageUrl={a.userAvatar} size="sm" />
                      <span className="text-xs font-medium">{a.userName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatEnum(a.role)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Upcoming Deadlines
                </p>
                <div className="space-y-1.5">
                  {upcomingDeadlines.map((d) => {
                    const isOverdue = new Date(d.dueDate) < new Date();
                    return (
                      <div
                        key={d.id}
                        className={`flex items-start gap-2 rounded-md p-2 text-xs ${
                          isOverdue ? "bg-destructive/10" : "bg-muted/50"
                        }`}
                      >
                        {isOverdue ? (
                          <AlertCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        ) : (
                          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{d.title}</p>
                          <p className={`text-[10px] ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {formatRelativeDate(new Date(d.dueDate))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Active Tasks
                </p>
                <div className="space-y-1.5">
                  {activeTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-start gap-2 rounded-md bg-muted/50 p-2 text-xs"
                    >
                      <ListTodo className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{t.title}</p>
                        {t.dueDate && (
                          <p className="text-[10px] text-muted-foreground">
                            Due {formatRelativeDate(new Date(t.dueDate))}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/cases/${caseData.id}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/billing?caseId=${caseData.id}`}>
                <Receipt className="mr-1.5 h-3.5 w-3.5" />
                Billing
              </Link>
            </Button>
          </div>
          {caseData.status !== "closed" && caseData.status !== "archived" && (
            <ArchiveCaseButton caseId={caseData.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
