"use client";

/**
 * Who is signed in, for the whole app.
 *
 * Firebase is touched only after mount: the SDK needs browser APIs, and the
 * server has no way to know the answer anyway, so every render starts from
 * `loading` and settles once `onAuthStateChanged` fires.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { migrateLocalCards } from "@/features/flashcards/migrate";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { ensureUserDocument } from "@/lib/firebase/user";

export type AuthStatus =
  | "loading"
  /** No `.env.local` yet — the app runs, but nothing can be saved. */
  | "unconfigured"
  | "signed-in"
  | "signed-out";

export type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  /** Last sign-in failure, in Polish, ready to render. */
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Codes where the popup never had a chance — worth retrying as a redirect. */
const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/operation-not-supported-in-this-environment",
]);

function errorCode(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : "";
}

function describeError(code: string): string | null {
  switch (code) {
    // The user closed the window or clicked the button twice — not an error.
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/unauthorized-domain":
      return "Ta domena nie jest dopuszczona w Firebase — dodaj ją w Authentication → Settings → Authorized domains.";
    case "auth/network-request-failed":
      return "Brak połączenia z Firebase. Sprawdź internet i spróbuj ponownie.";
    case "auth/operation-not-allowed":
      return "Ta metoda logowania jest wyłączona w konsoli Firebase (Authentication → Sign-in method).";
    // Firebase celowo nie zdradza, czy konto istnieje — jeden komunikat na
    // złe hasło i nieznany adres, żeby nie robić z logowania listy kont.
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Nieprawidłowy e-mail lub hasło.";
    case "auth/invalid-email":
      return "To nie wygląda na poprawny adres e-mail.";
    case "auth/missing-password":
      return "Podaj hasło.";
    case "auth/email-already-in-use":
      return "Konto z tym adresem już istnieje — zaloguj się zamiast rejestrować.";
    case "auth/weak-password":
      return "Hasło musi mieć co najmniej 6 znaków.";
    case "auth/user-disabled":
      return "To konto zostało zablokowane.";
    case "auth/too-many-requests":
      return "Za dużo prób logowania. Odczekaj chwilę i spróbuj ponownie.";
    default:
      return "Nie udało się zalogować. Spróbuj ponownie.";
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // `isFirebaseConfigured` is decided at build time from inlined env vars, so
  // server and client agree on it — safe as an initial state, and it puts the
  // setup instructions in the prerendered HTML instead of after hydration.
  const [status, setStatus] = useState<AuthStatus>(
    isFirebaseConfigured ? "loading" : "unconfigured",
  );
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Which account already had its profile written and local deck uploaded.
  const preparedUid = useRef<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    return onAuthStateChanged(getFirebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? "signed-in" : "signed-out");
      if (!nextUser) preparedUid.current = null;
    });
  }, []);

  // Profile document and the one-time localStorage migration. Both are
  // best-effort: a failure must not keep the user out of a review session, and
  // the migration flag is only set on success, so it retries on the next visit.
  useEffect(() => {
    if (!user || preparedUid.current === user.uid) return;
    preparedUid.current = user.uid;

    void (async () => {
      try {
        await ensureUserDocument(user);
        await migrateLocalCards(user.uid);
      } catch {
        preparedUid.current = null;
      }
    })();
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);

    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (caught) {
      const code = errorCode(caught);

      if (REDIRECT_FALLBACK_CODES.has(code)) {
        // Installed PWAs and in-app browsers often block popups; a full-page
        // redirect is the only flow left there.
        await signInWithRedirect(auth, provider);
        return;
      }

      setError(describeError(code));
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (caught) {
      setError(describeError(errorCode(caught)));
    }
  }, []);

  /**
   * Registration doubles as sign-in — Firebase leaves the new account signed
   * in, so the profile document and the localStorage migration run through the
   * same path as any other visit.
   */
  const registerWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);

      try {
        await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      } catch (caught) {
        setError(describeError(errorCode(caught)));
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  return (
    <AuthContext
      value={{
        status,
        user,
        error,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth wymaga AuthProvider — dodaj go w layoucie.");
  }

  return value;
}
