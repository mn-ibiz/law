import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ban } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Suspended",
  description: "Your organization's account has been suspended",
};

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <Ban className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your organization&apos;s account has been suspended. This may be due to a billing issue
            or a violation of our terms of service. Please contact support to resolve this.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please reach out to our support team.
          </p>
          <Button asChild variant="outline">
            <a href={`mailto:${siteConfig.supportEmail}`}>Contact Support</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
