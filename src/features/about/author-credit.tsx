import { Fragment } from "react";
import Link from "next/link";

import { AUTHOR, authorLinks } from "@/data/about";
import { cn } from "@/lib/utils";

/**
 * The signature: one small line of authorship, with the links that exist.
 *
 * Lives at the bottom of the login screen and of the dashboard — the two places
 * that have a bottom to speak of. The rest of the app ends in the tab bar, and
 * a credit line squeezed above it would read as another control.
 *
 * The taps here are deliberately smaller than the 44 px the rest of the app
 * holds to: this is a signature, not a destination. Anyone who actually wants
 * the links gets them full size on `/about`, one tap away.
 *
 * Static content, so it stays a server component and ships in the HTML — which
 * is also what makes it visible to anything crawling the login page.
 */
export function AuthorCredit({ className }: { className?: string }) {
  const links = authorLinks();

  return (
    <div
      className={cn(
        // Four links plus a full name do not fit one 430 px line, so the row
        // wraps — and every child carries the same vertical padding, or the
        // second line sits tighter than the first.
        "flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <span className="py-2">
        Autorem jest{" "}
        <span className="font-medium text-foreground">{AUTHOR.name}</span>
      </span>

      {links.map((link) => (
        <Fragment key={link.href}>
          <Separator />
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="py-2 underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </a>
        </Fragment>
      ))}

      <Separator />
      <Link
        href="/about"
        className="py-2 underline-offset-4 hover:text-foreground hover:underline"
      >
        O aplikacji
      </Link>
    </div>
  );
}

/** Decorative: read aloud, a row of middots is a row of noise. */
function Separator() {
  return <span aria-hidden>·</span>;
}
