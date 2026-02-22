"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function safeAction<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Re-throw Next.js control flow exceptions (redirect, notFound)
    // These are thrown by redirect() and notFound() and must propagate
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof Error && error.message === "NEXT_NOT_FOUND") {
      throw error;
    }

    console.error("[safeAction]", error);
    return { error: "An unexpected error occurred" } as T;
  }
}
