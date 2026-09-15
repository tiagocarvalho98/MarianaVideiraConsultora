"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginAction } from "./actions";
import type { LoginState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const next = searchParams.get("next") ?? "/crm/hoje";

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-stone-800">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-12 w-full rounded-xl border border-border bg-white px-4 text-base outline-none transition focus:border-primary"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-stone-800">
          Palavra-passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-12 w-full rounded-xl border border-border bg-white px-4 text-base outline-none transition focus:border-primary"
        />
      </div>
      {state.error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Entrar
      </Button>
    </form>
  );
}
