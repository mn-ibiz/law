"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKES } from "@/lib/utils/format";
import { APP_LOCALE } from "@/lib/constants/locale";

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

export function AttorneyDetailTabs({ attorney }: { attorney: Attorney }) {
  return (
    <Tabs defaultValue="profile" className="space-y-4">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="licenses">Licenses</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
        <TabsTrigger value="cpd">CPD</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="font-medium">{attorney.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Phone</dt>
                <dd className="font-medium">{attorney.phone ?? "—"}</dd>
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
                <dd className="font-medium">{attorney.lskNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Hourly Rate</dt>
                <dd className="font-medium">
                  {attorney.hourlyRate ? formatKES(Number(attorney.hourlyRate)) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date Admitted</dt>
                <dd className="font-medium">
                  {attorney.dateAdmitted
                    ? new Date(attorney.dateAdmitted).toLocaleDateString(APP_LOCALE)
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Department</dt>
                <dd className="font-medium">{attorney.department ?? "—"}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm text-muted-foreground">Designations</dt>
                <dd className="flex gap-2 mt-1">
                  {attorney.commissionerForOaths && (
                    <Badge variant="outline">Commissioner for Oaths</Badge>
                  )}
                  {attorney.notaryPublic && (
                    <Badge variant="outline">Notary Public</Badge>
                  )}
                  {attorney.seniorCounsel && (
                    <Badge variant="outline">Senior Counsel</Badge>
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
        <Card>
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
        <Card>
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
        <Card>
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

      <TabsContent value="performance">
        <Card>
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
        <Card>
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
