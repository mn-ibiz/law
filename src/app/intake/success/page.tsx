import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submission Received",
  description: "Your intake form has been submitted successfully",
};

export default function IntakeSuccessPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle>Submission Received</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-2">
        <p className="text-muted-foreground">
          Thank you for your submission. Our team will review your information and
          contact you within 2 business days.
        </p>
        <p className="text-sm text-muted-foreground">
          Your data is protected under the Kenya Data Protection Act, 2019.
        </p>
      </CardContent>
    </Card>
  );
}
