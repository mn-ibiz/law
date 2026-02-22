"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Shield, AlertTriangle, CheckCircle, FileText } from "lucide-react";

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

const kycStatusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  verified: "default",
  pending: "outline",
  rejected: "destructive",
  expired: "secondary",
};

const riskVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "default",
  medium: "outline",
  high: "destructive",
  critical: "destructive",
};

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
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
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
                  <dd className="font-medium">{client.nationalId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">KRA PIN</dt>
                  <dd className="font-medium">{client.kraPin ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Passport</dt>
                  <dd className="font-medium">{client.passportNumber ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">County</dt>
                  <dd className="font-medium">{client.county ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">P.O. Box</dt>
                  <dd className="font-medium">{client.poBox ?? "—"}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm text-muted-foreground">Physical Address</dt>
                  <dd className="font-medium">{client.physicalAddress ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd className="font-medium">
                    {client.dateOfBirth
                      ? new Date(client.dateOfBirth).toLocaleDateString("en-KE")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Next of Kin</dt>
                  <dd className="font-medium">{client.nextOfKin ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Employer</dt>
                  <dd className="font-medium">{client.employer ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Referral Source</dt>
                  <dd className="font-medium">{client.referralSource ?? "—"}</dd>
                </div>
                {client.notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm text-muted-foreground">Notes</dt>
                    <dd className="font-medium whitespace-pre-wrap">{client.notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
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
                          {new Date(c.contactDate).toLocaleDateString("en-KE")}
                        </TableCell>
                        <TableCell className="capitalize">
                          {c.type.replace("_", " ")}
                        </TableCell>
                        <TableCell>{c.subject}</TableCell>
                        <TableCell>{c.contactedByName ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyc">
          <Card>
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
                          {doc.documentType.replace("_", " ")}
                        </TableCell>
                        <TableCell>{doc.documentNumber ?? "—"}</TableCell>
                        <TableCell>
                          <Badge variant={kycStatusVariant[doc.status] ?? "secondary"}>
                            {doc.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{doc.verifiedByName ?? "—"}</TableCell>
                        <TableCell>
                          {doc.expiryDate
                            ? new Date(doc.expiryDate).toLocaleDateString("en-KE")
                            : "—"}
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
          <Card>
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
                    <dd>
                      <Badge variant={riskVariant[riskAssessment.riskLevel] ?? "secondary"}>
                        {riskAssessment.riskLevel}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Assessed</dt>
                    <dd className="font-medium">
                      {new Date(riskAssessment.createdAt).toLocaleDateString("en-KE")}
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
          <Card>
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
