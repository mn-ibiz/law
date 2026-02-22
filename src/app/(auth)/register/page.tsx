import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/forms/register-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new client account",
};

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Register for a client account. Admin approval is required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
