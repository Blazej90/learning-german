import { ExternalLink } from "lucide-react";

import { RESOURCE_GROUPS } from "@/data/resources";

/**
 * Materials from section 3 of `star learn german.md`.
 *
 * Static content, so this stays a server component — nothing here needs the
 * browser, and it keeps the links in the prerendered HTML.
 */
export function ResourceList() {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="font-medium">Materiały</h2>
        <p className="text-sm text-muted-foreground">
          Jeden kurs, jedno źródło słuchania i jedna aplikacja do rozmów w
          zupełności wystarczą na start.
        </p>
      </div>

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
                  className="group inline-flex items-center gap-1.5 font-medium underline-offset-4 hover:underline"
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
    </section>
  );
}
