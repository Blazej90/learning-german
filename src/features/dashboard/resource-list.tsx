import { ChevronRight, ExternalLink } from "lucide-react";

import { RESOURCE_GROUPS } from "@/data/resources";

/**
 * Materials from section 3 of `star learn german.md`.
 *
 * Collapsed by default. These links are picked once and then rarely opened, so
 * on a phone they were three screenfuls of scrolling between the dashboard and
 * nothing — `details` keeps them one tap away without spending the space.
 *
 * Static content, so this stays a server component — nothing here needs the
 * browser, and it keeps the links in the prerendered HTML.
 */
export function ResourceList() {
  return (
    <details className="group rounded-xl bg-card px-4 ring-1 ring-foreground/10">
      <summary className="-mx-4 flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
        />
        Materiały
      </summary>

      <div className="flex flex-col gap-5 pb-4">
        <p className="text-sm text-muted-foreground">
          Jeden kurs, jedno źródło słuchania i jedna aplikacja do rozmów w
          zupełności wystarczą na start.
        </p>

        {RESOURCE_GROUPS.map((group) => (
          <div key={group.id} className="flex flex-col gap-2">
            <h3 className="text-sm text-muted-foreground">{group.title}</h3>
            <ul className="flex flex-col gap-3">
              {group.resources.map((resource) => (
                <li key={resource.url}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
                  >
                    {resource.name}
                    <ExternalLink
                      aria-hidden
                      className="size-3.5 text-muted-foreground"
                    />
                  </a>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
