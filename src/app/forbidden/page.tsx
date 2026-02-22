import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldX } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied",
  description: "You do not have permission to access this page",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <ShieldX className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
