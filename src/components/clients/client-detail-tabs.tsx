"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveBadge } from "@/components/shared/status-badges";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConflictCheckDialog } from "./conflict-check-dialog";
import { formatEnum } from "@/lib/utils/format-enum";
import { Shield, ShieldAlert, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { APP_LOCALE } from "@/lib/constants/locale";

interface Client {
  id: string;
  type: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  companyName: string | null;
  industry: string | null;
  taxId: string | null;
  nationalId: string | null;
  passportNumber: string | null;
  kraPin: string | null;
  county: string | null;
  poBox: string | null;
  physicalAddress: string | null;
  nextOfKin: string | null;
  employer: string | null;
  referralSource: string | null;
  notes: string | null;
  isPep: boolean;
  pepDetails: string | null;
  createdAt: Date;
}

interface ContactLog {
  id: string;
  type: string;
  subject: string;
  notes: string | null;
  contactDate: Date;
  contactedByName: string | null;
}

interface KycDocument {
  id: string;
  documentType: string;
  documentNumber: string | null;
  fileUrl: string | null;
  status: string;
  verifiedAt: Date | null;
  expiryDate: Date | null;
  createdAt: Date;
  verifiedByName: string | null;
}

interface RiskAssessment {
  id: string;
  riskLevel: string;
  factors: string | null;
  notes: string | null;
  createdAt: Date;
}

interface ClientDetailTabsProps {
  client: Client;
  contacts: ContactLog[];
  kycDocuments: KycDocument[];
  riskAssessment: RiskAssessment | null;
}

/* ── KYC document status capsule ── */
const capsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap";

const kycStatusStyles: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  expired: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

function KycStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(capsule, kycStatusStyles[status] ?? kycStatusStyles.pending)}>
      {formatEnum(status)}
    </span>
  );
}

/* ── Risk level capsule ── */
const riskLevelStyles: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  high: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  critical: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-600/25",
};

function RiskLevelBadge({ level }: { level: string }) {
  return (
    <span className={cn(capsule, riskLevelStyles[level] ?? riskLevelStyles.medium)}>
      {formatEnum(level)}
    </span>
  );
}

export function ClientDetailTabs({ client, contacts, kycDocuments, riskAssessment }: ClientDetailTabsProps) {
  const [conflictOpen, setConflictOpen] = useState(false);

  return (
    <>
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contacts">Contact Log</TabsTrigger>
          <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Information</CardTitle>
                <ActiveBadge active={client.status === "active"} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Type</dt>
                  <dd className="font-medium capitalize">{client.type}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd className="font-medium">{client.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{client.phone}</dd>
                </div>
                {client.companyName && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Company</dt>
                    <dd className="font-medium">{client.companyName}</dd>
                  </div>
                )}
                {client.industry && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Industry</dt>
                    <dd className="font-medium">{client.industry}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-muted-foreground">National ID</dt>
                  <dd className="font-medium">{client.nationalId ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">KRA PIN</dt>
                  <dd className="font-medium">{client.kraPin ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Passport</dt>
                  <dd className="font-medium">{client.passportNumber ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">County</dt>
                  <dd className="font-medium">{client.county ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">P.O. Box</dt>
                  <dd className="font-medium">{client.poBox ?? "\u2014"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm text-muted-foreground">Physical Address</dt>
                  <dd className="font-medium">{client.physicalAddress ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd className="font-medium">
                    {client.dateOfBirth
                      ? new Date(client.dateOfBirth).toLocaleDateString(APP_LOCALE)
                      : "\u2014"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Next of Kin</dt>
                  <dd className="font-medium">{client.nextOfKin ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Employer</dt>
                  <dd className="font-medium">{client.employer ?? "\u2014"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Referral Source</dt>
                  <dd className="font-medium">{client.referralSource ?? "\u2014"}</dd>
                </div>
                {client.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm text-muted-foreground">Notes</dt>
                    <dd className="font-medium whitespace-pre-wrap">{client.notes}</dd>
                  </div>
                )}
              </dl>

              {/* PEP Screening Section */}
              <div className="mt-6 border-t pt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <ShieldAlert className="h-4 w-4" />
                  PEP Screening
                </h3>
                {client.isPep ? (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive" className="gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Politically Exposed Person
                      </Badge>
                    </div>
                    {client.pepDetails && (
                      <p className="text-sm text-rose-800 whitespace-pre-wrap mt-2">
                        {client.pepDetails}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This client is not flagged as a Politically Exposed Person (PEP).
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Contact History</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contact logs recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Contacted By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          {new Date(c.contactDate).toLocaleDateString(APP_LOCALE)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {formatEnum(c.type)}
                        </TableCell>
                        <TableCell>{c.subject}</TableCell>
                        <TableCell>{c.contactedByName ?? "\u2014"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  KYC Documents
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {kycDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No KYC documents uploaded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified By</TableHead>
                      <TableHead>Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="capitalize">
                          {formatEnum(doc.documentType)}
                        </TableCell>
                        <TableCell>{doc.documentNumber ?? "\u2014"}</TableCell>
                        <TableCell>
                          <KycStatusBadge status={doc.status} />
                        </TableCell>
                        <TableCell>{doc.verifiedByName ?? "\u2014"}</TableCell>
                        <TableCell>
                          {doc.expiryDate
                            ? new Date(doc.expiryDate).toLocaleDateString(APP_LOCALE)
                            : "\u2014"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskAssessment ? (
                <dl className="grid gap-4 md:grid-cols-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Risk Level</dt>
                    <dd className="mt-1">
                      <RiskLevelBadge level={riskAssessment.riskLevel} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Assessed</dt>
                    <dd className="font-medium">
                      {new Date(riskAssessment.createdAt).toLocaleDateString(APP_LOCALE)}
                    </dd>
                  </div>
                  {riskAssessment.factors && (
                    <div className="md:col-span-2">
                      <dt className="text-sm text-muted-foreground">Risk Factors</dt>
                      <dd className="font-medium whitespace-pre-wrap">{riskAssessment.factors}</dd>
                    </div>
                  )}
                  {riskAssessment.notes && (
                    <div className="md:col-span-2">
                      <dt className="text-sm text-muted-foreground">Notes</dt>
                      <dd className="font-medium whitespace-pre-wrap">{riskAssessment.notes}</dd>
                    </div>
                  )}
                </dl>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  No risk assessment performed yet.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Conflict Checks
                </CardTitle>
                <Button onClick={() => setConflictOpen(true)}>Run Conflict Check</Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Run a conflict check to verify there are no conflicts of interest for this client.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConflictCheckDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        clientId={client.id}
        clientName={`${client.firstName} ${client.lastName}`}
      />
    </>
  );
}
