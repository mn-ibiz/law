"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

type ActionResult<T> = { data?: T; error?: string; success?: boolean };

interface UseActionOptions<T> {
  onSuccess?: (data?: T) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useAction<TInput, TOutput>(
  action: (input: TInput) => Promise<ActionResult<TOutput>>,
  options: UseActionOptions<TOutput> = {}
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    (input: TInput) => {
      setError(null);
      startTransition(async () => {
        const result = await action(input);
        if (result?.error) {
          setError(result.error);
          toast.error(options.errorMessage ?? result.error);
          options.onError?.(result.error);
        } else {
          if (options.successMessage) toast.success(options.successMessage);
          options.onSuccess?.(result?.data);
        }
      });
    },
    [action, options]
  );

  return { execute, isPending, error };
}

/** Variant for actions that take no input (e.g. delete by id already bound) */
export function useActionFn<TOutput>(
  action: () => Promise<ActionResult<TOutput>>,
  options: UseActionOptions<TOutput> = {}
) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(result.error);
        toast.error(options.errorMessage ?? result.error);
        options.onError?.(result.error);
      } else {
        if (options.successMessage) toast.success(options.successMessage);
        options.onSuccess?.(result?.data);
      }
    });
  }, [action, options]);

  return { execute, isPending, error };
}
