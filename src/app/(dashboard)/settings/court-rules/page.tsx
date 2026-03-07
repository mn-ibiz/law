import { requireOrg } from "@/lib/auth/get-session";
import { getCourtRules } from "@/lib/queries/courts";
import { getCourts } from "@/lib/queries/courts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CourtRuleActions } from "@/components/courts/court-rule-actions";
import { CourtRuleFormDialog } from "@/components/courts/court-rule-form-dialog";
import { formatEnum } from "@/lib/utils/format-enum";
import { Gavel } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Court Rules",
  description: "Manage court deadline rules and automations",
};

export default async function CourtRulesPage() {
  const { organizationId } = await requireOrg();
  const [rules, courts] = await Promise.all([
    getCourtRules(organizationId),
    getCourts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
            <Gavel className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Court Rules</h1>
            <p className="text-sm text-muted-foreground">
              Manage court deadline rules. When a court hearing is scheduled, these rules
              automatically generate deadlines based on the configured offset days.
            </p>
          </div>
        </div>
        <CourtRuleFormDialog courts={courts} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Rules ({rules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Gavel className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-semibold">No court rules configured</h3>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Add court rules to automatically generate deadlines when court hearings are scheduled.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="text-right">Offset Days</TableHead>
                  <TableHead>Deadline Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Statutory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.courtName ?? (
                        <span className="text-muted-foreground text-xs">All courts</span>
                      )}
                    </TableCell>
                    <TableCell>{formatEnum(rule.triggerEvent)}</TableCell>
                    <TableCell className="text-right">
                      <span className={rule.offsetDays < 0 ? "text-red-600" : "text-green-600"}>
                        {rule.offsetDays > 0 ? `+${rule.offsetDays}` : rule.offsetDays}
                      </span>
                    </TableCell>
                    <TableCell>{rule.deadlineTitle}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rule.priority === "critical"
                            ? "destructive"
                            : rule.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {formatEnum(rule.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.isStatutory ? (
                        <Badge variant="outline">Statutory</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <CourtRuleActions
                        id={rule.id}
                        name={rule.name}
                        isActive={rule.isActive}
                        rule={{
                          id: rule.id,
                          courtId: rule.courtId,
                          name: rule.name,
                          description: rule.description,
                          triggerEvent: rule.triggerEvent,
                          offsetDays: rule.offsetDays,
                          deadlineTitle: rule.deadlineTitle,
                          priority: rule.priority,
                          isStatutory: rule.isStatutory,
                        }}
                        courts={courts}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
