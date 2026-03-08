"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActiveBadge } from "@/components/shared/status-badges";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/format";
import { IndemnityTab } from "@/components/attorneys/indemnity-tab";
import { LskMembershipTab } from "@/components/attorneys/lsk-membership-tab";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

const designationCapsule =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none whitespace-nowrap bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";

interface Attorney {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  barNumber: string;
  jurisdiction: string;
  title: string;
  department: string | null;
  hourlyRate: string | null;
  dateAdmitted: Date | null;
  bio: string | null;
  lskNumber: string | null;
  commissionerForOaths: boolean | null;
  notaryPublic: boolean | null;
  seniorCounsel: boolean | null;
  isActive: boolean;
  createdAt: Date;
}

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

interface LskMembershipRecord {
  id: string;
  attorneyId: string;
  year: string;
  amount: string;
  paymentDate: Date | null;
  receiptNumber: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AttorneyDetailTabsProps {
  attorney: Attorney;
  indemnityRecords?: IndemnityRecord[];
  lskMembershipRecords?: LskMembershipRecord[];
}

export function AttorneyDetailTabs({ attorney, indemnityRecords = [], lskMembershipRecords = [] }: AttorneyDetailTabsProps) {
  const { currency, locale } = useOrgConfig();
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="licenses">Licenses</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
        <TabsTrigger value="cpd">CPD</TabsTrigger>
        <TabsTrigger value="insurance">Insurance</TabsTrigger>
        <TabsTrigger value="lsk">LSK</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Professional Profile</CardTitle>
              <ActiveBadge active={attorney.isActive} />
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium">{attorney.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="font-medium">{attorney.phone ?? "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Bar Number</dt>
                <dd className="font-medium">{attorney.barNumber}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Jurisdiction</dt>
                <dd className="font-medium">{attorney.jurisdiction}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">LSK Number</dt>
                <dd className="font-medium">{attorney.lskNumber ?? "\u2014"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Hourly Rate</dt>
                <dd className="font-medium">
                  {attorney.hourlyRate ? formatCurrency(Number(attorney.hourlyRate), currency, locale) : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date Admitted</dt>
                <dd className="font-medium">
                  {attorney.dateAdmitted
                    ? new Date(attorney.dateAdmitted).toLocaleDateString(locale)
                    : "\u2014"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Department</dt>
                <dd className="font-medium">{attorney.department ?? "\u2014"}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm text-muted-foreground">Designations</dt>
                <dd className="flex gap-2 mt-1">
                  {attorney.commissionerForOaths && (
                    <span className={designationCapsule}>Commissioner for Oaths</span>
                  )}
                  {attorney.notaryPublic && (
                    <span className={designationCapsule}>Notary Public</span>
                  )}
                  {attorney.seniorCounsel && (
                    <span className={cn(designationCapsule, "bg-amber-50 text-amber-700 ring-amber-600/20")}>
                      Senior Counsel
                    </span>
                  )}
                  {!attorney.commissionerForOaths &&
                    !attorney.notaryPublic &&
                    !attorney.seniorCounsel && (
                      <span className="text-muted-foreground">None</span>
                    )}
                </dd>
              </div>
              {attorney.bio && (
                <div className="md:col-span-2">
                  <dt className="text-sm text-muted-foreground">Bio</dt>
                  <dd className="font-medium whitespace-pre-wrap">{attorney.bio}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="licenses">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Additional Licenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              License management is available for this attorney.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="certificates">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Practising Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Certificate tracking will appear here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cpd">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>CPD Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              CPD compliance tracking will appear here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="insurance">
        <IndemnityTab attorneyId={attorney.id} records={indemnityRecords} />
      </TabsContent>

      <TabsContent value="lsk">
        <LskMembershipTab attorneyId={attorney.id} records={lskMembershipRecords} />
      </TabsContent>

      <TabsContent value="performance">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Performance data will appear here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="disciplinary">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Disciplinary Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Disciplinary proceedings will be tracked here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
