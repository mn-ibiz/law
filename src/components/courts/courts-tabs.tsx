"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatEnum } from "@/lib/utils/format-enum";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";
import { FilingStatusBadge } from "@/components/shared/status-badges";
import { FilingForm } from "@/components/courts/filing-form";
import { ServiceForm } from "@/components/courts/service-form";
import { FilingRowActions } from "@/components/courts/filing-row-actions";
import { ServiceRowActions } from "@/components/courts/service-row-actions";
import { ServiceEditDialog } from "@/components/courts/service-edit-dialog";
import { CourtEditDialog } from "@/components/courts/court-edit-dialog";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Court {
  id: string;
  name: string;
  level: string;
  jurisdiction: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  stations: { id: string; name: string; county: string | null }[];
}

interface Filing {
  id: string;
  caseId: string;
  courtId: string | null;
  filingType: string;
  filingNumber: string | null;
  status: string;
  filingDate: Date | null;
  documentUrl: string | null;
  notes: string | null;
  courtName: string | null;
  caseNumber: string;
  filedByName: string | null;
  createdAt: Date;
}

interface ServiceRecord {
  id: string;
  caseId: string;
  documentTitle: string;
  servedTo: string;
  method: string;
  serviceDate: Date | null;
  proofOfServiceUrl: string | null;
  notes: string | null;
  caseNumber: string;
  servedByName: string | null;
  createdAt: Date;
}

interface CourtsTabsProps {
  hierarchy: Court[];
  filings: Filing[];
  serviceRecords: ServiceRecord[];
  cases: { id: string; caseNumber: string; title: string }[];
  courts: { id: string; name: string }[];
  userRole?: string;
}

const levelStyles: Record<string, string> = {
  supreme: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  appellate: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  high: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  magistrate: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  tribunal: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20",
};

const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

export function CourtsTabs({ hierarchy, filings, serviceRecords, cases, courts, userRole }: CourtsTabsProps) {
  const { locale } = useOrgConfig();
  const [showFilingForm, setShowFilingForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const isAdmin = userRole === "admin";

  return (
    <>
      <Tabs defaultValue="courts">
        <TabsList>
          <TabsTrigger value="courts">Courts</TabsTrigger>
          <TabsTrigger value="filings">Filings</TabsTrigger>
          <TabsTrigger value="service">Service</TabsTrigger>
        </TabsList>

        {/* Courts Tab */}
        <TabsContent value="courts">
          {hierarchy.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No courts configured. Add courts in Settings to begin tracking filings.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {hierarchy.map((court) => (
                <Card key={court.id} className={cn("shadow-sm transition-all hover:shadow-md", !court.isActive && "opacity-60")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold">{court.name}</CardTitle>
                        {!court.isActive && (
                          <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            capsule,
                            levelStyles[court.level?.toLowerCase()] ??
                              "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20"
                          )}
                        >
                          {court.level}
                        </span>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditingCourt(court)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-2 text-sm">
                      {court.jurisdiction && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Jurisdiction
                          </dt>
                          <dd className="mt-0.5 font-medium">{court.jurisdiction}</dd>
                        </div>
                      )}
                      {court.address && (
                        <div>
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Address
                          </dt>
                          <dd className="mt-0.5 font-medium">{court.address}</dd>
                        </div>
                      )}
                    </dl>
                    {court.stations.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Stations ({court.stations.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {court.stations.map((station) => (
                            <span
                              key={station.id}
                              className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary ring-1 ring-inset ring-primary/10"
                            >
                              {station.name}
                              {station.county && ` (${station.county})`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Filings Tab */}
        <TabsContent value="filings">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Court Filings</CardTitle>
              <Button size="sm" onClick={() => setShowFilingForm(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                New Filing
              </Button>
            </CardHeader>
            <CardContent>
              {filings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No court filings recorded yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filing Date</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Court</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filing Type</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filing Number</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filings.map((f) => (
                      <TableRow key={f.id} className="transition-colors hover:bg-muted/50">
                        <TableCell>
                          {f.filingDate ? new Date(f.filingDate).toLocaleDateString(locale) : "\u2014"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{f.caseNumber}</TableCell>
                        <TableCell>{f.courtName ?? "\u2014"}</TableCell>
                        <TableCell>{f.filingType}</TableCell>
                        <TableCell className="font-mono text-xs">{f.filingNumber ?? "\u2014"}</TableCell>
                        <TableCell>
                          <FilingStatusBadge status={f.status} />
                        </TableCell>
                        <TableCell>
                          <FilingRowActions
                            filing={{
                              id: f.id,
                              caseId: f.caseId,
                              courtId: f.courtId,
                              filingType: f.filingType,
                              filingNumber: f.filingNumber,
                              filingDate: f.filingDate,
                              documentUrl: f.documentUrl,
                              notes: f.notes,
                              status: f.status,
                            }}
                            cases={cases}
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
        </TabsContent>

        {/* Service Tab */}
        <TabsContent value="service">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service of Process</CardTitle>
              <Button size="sm" onClick={() => setShowServiceForm(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Record Service
              </Button>
            </CardHeader>
            <CardContent>
              {serviceRecords.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No service of process records yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date Served</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Case</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Document</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Party Served</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Method</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Served By</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proof</TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-muted-foreground w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceRecords.map((s) => (
                      <TableRow key={s.id} className="transition-colors hover:bg-muted/50">
                        <TableCell>
                          {s.serviceDate ? new Date(s.serviceDate).toLocaleDateString(locale) : "\u2014"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{s.caseNumber}</TableCell>
                        <TableCell>{s.documentTitle}</TableCell>
                        <TableCell>{s.servedTo}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap text-slate-600 ring-1 ring-inset ring-slate-500/20">
                            {formatEnum(s.method)}
                          </span>
                        </TableCell>
                        <TableCell>{s.servedByName ?? "\u2014"}</TableCell>
                        <TableCell>
                          {s.proofOfServiceUrl ? (
                            <a href={s.proofOfServiceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-xs">{"\u2014"}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ServiceRowActions
                            record={{
                              id: s.id,
                              caseId: s.caseId,
                              documentTitle: s.documentTitle,
                              servedTo: s.servedTo,
                              method: s.method,
                              serviceDate: s.serviceDate,
                              proofOfServiceUrl: s.proofOfServiceUrl,
                              notes: s.notes,
                            }}
                            cases={cases}
                            onEdit={(rec) => setEditingService(rec as ServiceRecord)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Filing Form Dialog */}
      <FilingForm
        open={showFilingForm}
        onOpenChange={setShowFilingForm}
        cases={cases}
        courts={courts}
      />

      {/* Service Form Dialog */}
      <ServiceForm
        open={showServiceForm}
        onOpenChange={setShowServiceForm}
        cases={cases}
      />

      {/* Court Edit Dialog */}
      {editingCourt && (
        <CourtEditDialog
          court={editingCourt}
          open={!!editingCourt}
          onOpenChange={(open) => {
            if (!open) setEditingCourt(null);
          }}
        />
      )}

      {/* Service Edit Dialog */}
      {editingService && (
        <ServiceEditDialog
          record={editingService}
          open={!!editingService}
          onOpenChange={(open) => {
            if (!open) setEditingService(null);
          }}
          cases={cases}
        />
      )}
    </>
  );
}
