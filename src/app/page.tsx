import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, Shield, Users, FileText, Calendar, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6" />
            <span className="text-xl font-bold">Law Firm Registry</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button asChild>
              <a href="/register">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Built for Kenya Law Firms
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Modern Legal Practice Management
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Streamline your law firm operations with case management, billing, document handling,
            and full compliance with Kenya&apos;s Advocates Act and AML/CFT regulations.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <a href="/login">Sign In</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/register">Register</a>
            </Button>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Client & Attorney Management</CardTitle>
              <CardDescription>
                Manage attorneys, clients, KYC compliance, and conflict of interest checks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Case Management</CardTitle>
              <CardDescription>
                Track cases through the full lifecycle with Kenya court hierarchy support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Compliance & Security</CardTitle>
              <CardDescription>
                AML/CFT compliance, KRA tax integration, and Data Protection Act adherence.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Calendar & Deadlines</CardTitle>
              <CardDescription>
                Court calendar, deadline tracking, and automated file bring-up reminders.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Billing & Finance</CardTitle>
              <CardDescription>
                Fee notes, M-Pesa payments, trust accounts, and KES + VAT 16% support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Scale className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Document Management</CardTitle>
              <CardDescription>
                Upload, version, template, and e-sign legal documents securely.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Law Firm Registry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
