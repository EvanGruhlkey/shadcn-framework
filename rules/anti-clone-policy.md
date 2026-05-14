# Anti-Clone Policy

`shadcn-ui-framework` is explicitly designed to **prevent** the generation of
pages that imitate a specific real-world SaaS product. This policy is the
contract between the framework and the agents that consume it.

## 1. What we extract

We extract:

- **Structural patterns**: section archetypes, ordering, density.
- **Compositional rules**: spacing rhythm, density bands, type scale.
- **Statistical priors**: "76% of dev-tools landing pages have a logo
  strip directly under the hero" — that level of generality.

## 2. What we never extract or store

We never extract or store:

- Source code (HTML, CSS, JS) of any captured site.
- Logos, illustrations, mascots, or product screenshots.
- Brand colors tied to a recognizable identity.
- Verbatim or near-verbatim copy.
- Custom typography or font files.

The capture pipeline (`packages/capture`) stores only PNG screenshots of
public pages. Screenshots are kept for offline analysis and are not
republished by the framework. They are listed in `.gitignore` and never
committed.

## 3. What generated pages may not do

A page generated using this framework must not:

1. Reproduce the exact visual identity (logo, color, typography pairing) of
   any specific real SaaS product.
2. Reuse a tagline, sub-headline, or distinctive phrase associated with a
   real SaaS product. Token-level similarity is checked by
   `packages/evaluation/clone-risk-check.ts`.
3. Reproduce the section-by-section layout of a single real SaaS product.
   Structural similarity to any single observation in
   `datasets/observations/` must stay below the configured threshold
   (default `cosine ≤ 0.85` over the section-vector embedding).
4. Use a brand name, customer logo, or testimonial attribution that the
   user did not explicitly provide — **except** that naming a third-party
   product and showing its **integration mark** next to integration feature
   copy (e.g. “Send alerts to Slack”) is allowed. Do **not** imply that
   company is a customer, partner, or endorser unless the user’s brief says
   so.

## 4. Enforcement

Enforcement is a combination of human policy and machine checks.

### Machine checks

The `evaluate` command runs three classes of check:

| Check                     | File                                       | Threshold     |
| ------------------------- | ------------------------------------------ | ------------- |
| Token-level copy overlap  | `clone-risk-check.ts` → `tokenSimilarity`  | < 0.35        |
| Structural section match  | `clone-risk-check.ts` → `structuralCosine` | ≤ 0.85        |
| Forbidden phrase scan     | `clone-risk-check.ts` → `forbiddenPhrases` | 0 occurrences |

A failure on any check **fails the build**.

### Human review

Any page that passes machine checks but is flagged by a reviewer for
visual or conceptual similarity to a real product must be revised. The
machine checks are necessary, not sufficient.

## 5. Capture etiquette

The capture pipeline:

- Captures only publicly reachable pages (HTTP 200, no auth).
- Respects `robots.txt`. `packages/capture/screenshot-site.ts` aborts with a
  policy error if the path is disallowed.
- Sets a custom User-Agent identifying the framework and a contact URL.
- Limits per-domain request rate to **1 request every 4 seconds**.
- Stores no HTML or assets — only the rendered screenshot.

## 6. Attribution

When the framework's documentation (e.g. the studio app's atlas browser)
references a captured site, it does so as a citation, not as a showcase. We
identify the site by its public domain only, never by reproducing its
artwork.

## 7. Right to be removed

If the operator of a site appearing in our corpora requests removal, the
URL is removed from the corpus, all captured screenshots and observation
records are deleted, and the change is recorded in
`datasets/corpora/CHANGELOG.md`.
