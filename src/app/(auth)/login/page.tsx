import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Law Firm Registry account",
};

export default function LoginPage() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access the system</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-muted-foreground transition-colors hover:text-primary hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
