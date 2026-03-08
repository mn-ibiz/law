"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { resetPasswordAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true);
    try {
      const result = await resetPasswordAction(data);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message);
        setIsReset(true);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="text-center">
        <p className="mb-4 text-lg font-medium">Invalid Reset Link</p>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or incomplete. Please request a new one.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a href="/forgot-password">Request New Link</a>
        </Button>
      </div>
    );
  }

  if (isReset) {
    return (
      <div className="text-center">
        <p className="mb-4 text-lg font-medium">Password Reset</p>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </Form>
  );
}
