"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/auth-provider";
import { missingFirebaseEnvVars } from "@/lib/firebase/config";

/**
 * The whole login screen: Google, e-mail and password, or — before the Firebase
 * project is wired up — the list of env vars still missing. That last case is a
 * normal state during setup, not an error worth hiding.
 */
export function SignInPanel() {
  const { status, error, signInWithGoogle, signInWithEmail, registerWithEmail } =
    useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (status === "signed-in") router.replace("/");
  }, [router, status]);

  if (status === "unconfigured") return <MissingConfig />;

  if (status === "loading" || status === "signed-in") {
    return (
      <p className="text-muted-foreground" role="status">
        {status === "loading" ? "Sprawdzam logowanie…" : "Zalogowano, wchodzę…"}
      </p>
    );
  }

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void run(() =>
      mode === "sign-in"
        ? signInWithEmail(email, password)
        : registerWithEmail(email, password),
    );
  };

  const isRegistering = mode === "register";

  return (
    <div className="flex flex-col gap-6">
      <Button
        size="lg"
        variant="outline"
        className="h-11"
        disabled={isBusy}
        onClick={() => void run(signInWithGoogle)}
      >
        Zaloguj się przez Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        albo e-mailem
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            // Tells the browser's password manager whether to offer a saved
            // password or a generated one.
            autoComplete={isRegistering ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {isRegistering ? (
            <p className="text-xs text-muted-foreground">
              Minimum 6 znaków — tego wymaga Firebase.
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="h-11" disabled={isBusy}>
          {isBusy
            ? "Chwileczkę…"
            : isRegistering
              ? "Załóż konto"
              : "Zaloguj się"}
        </Button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        className="self-start text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setMode(isRegistering ? "sign-in" : "register")}
      >
        {isRegistering
          ? "Mam już konto — zaloguj mnie"
          : "Nie mam konta — załóż nowe"}
      </button>

      <p className="text-sm text-muted-foreground">
        Konto trzyma tylko Twoje postępy — zwroty i plan nauki są częścią
        aplikacji. Dzięki logowaniu powtórki z telefonu i z komputera to jedna
        talia.
      </p>
    </div>
  );
}

function MissingConfig() {
  const missing = missingFirebaseEnvVars();

  return (
    <div className="flex flex-col gap-4">
      <p role="alert" className="text-sm text-destructive">
        Firebase nie jest jeszcze skonfigurowany, więc logowanie nie zadziała.
      </p>
      <p className="text-sm text-muted-foreground">
        Skopiuj <code className="font-mono">.env.example</code> do{" "}
        <code className="font-mono">.env.local</code> i uzupełnij wartości z
        konsoli Firebase. Brakuje:
      </p>
      <ul className="flex flex-col gap-1 font-mono text-sm">
        {missing.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
