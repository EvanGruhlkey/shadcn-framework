# Copywriting Rules

Generated SaaS interfaces fail more often on copy than on layout. These rules
constrain the copy an AI agent may produce when composing a page from this
framework.

---

## 1. Voice

- Plain, declarative, present tense. Prefer "Ship faster" over "Shipping
  faster has never been easier".
- Second person ("you", "your team") for product benefits. First person
  plural ("we") only in About and Customer Story sections.
- No exclamation marks. No emoji in headings or buttons. Emoji are permitted
  in inline editorial copy only when functional (e.g. status indicators).

## 2. Headlines

- The H1 must be a complete sentence of **6 to 12 words**, ending with a
  period or no punctuation. Question-form H1s are not permitted.
- The H1 must name the *outcome*, not the product category. "Ship reliable
  background jobs" is allowed; "The job queue for modern teams" is not.
- The subheading directly under the H1 is one sentence of **15 to 30 words**.
  It expands the headline and names the *primary user* explicitly.

## 3. Section headings

- Each H2 begins with a verb or noun phrase, never a clause that needs
  context. "Built for engineering teams" is allowed; "And now, the part
  where..." is not.
- H2s use sentence case. Title Case headings are reserved for navigation
  items and button labels.

## 4. Buttons and CTAs

- Primary CTA labels are 1–3 words and start with a verb: "Start free",
  "Talk to sales", "Read the docs".
- Never label a CTA "Click here", "Learn more" without an object, or
  "Submit". A button label must be readable out of context.
- A page contains exactly **one primary CTA per fold**. Secondary CTAs use
  the `variant="ghost"` or `variant="outline"` shadcn button.

## 5. Feature copy

- Each feature item is a tuple of `(eyebrow, title, description)`.
  - **Eyebrow**: 1–3 words, optional, sentence case.
  - **Title**: 3–7 words, no period.
  - **Description**: 1–2 sentences, ≤ 200 characters total.
- Feature titles must be parallel in form. If one is a verb phrase ("Deploy
  in seconds"), all in the block are verb phrases.

## 6. Proof copy

- Quotes in testimonial blocks are between 80 and 220 characters. Longer
  quotes belong in case studies, not proof bands.
- Always include a real attribution `(name, role, company)`. Generation
  agents must use clearly fictional placeholder identities (e.g. "Engineer
  at an example fintech") rather than naming real companies.

## 7. Pricing copy

- Plan names use a single noun: "Starter", "Team", "Scale", "Enterprise".
  Do not name plans after metals, animals, or tiers ("Gold", "Whale", "Tier
  3").
- Each plan lists between 4 and 8 included features as bullet points.
  Features are written as noun phrases: "Unlimited projects", "SSO and
  SCIM", not "You get unlimited projects".

## 8. Forbidden phrases

The clone-risk evaluator flags these phrases. Do not use them:

- "Revolutionize your workflow"
- "Game-changing"
- "Next-generation platform"
- "Unleash the power of …"
- "Empower your team to …"
- "All-in-one solution for …"

Their use is a strong signal of low-quality, undifferentiated copy and
suggests the model is generating from the average of marketing pages rather
than from this framework's pattern atlas.

## 9. Originality

- Do not paraphrase a known SaaS company's tagline. The anti-clone policy
  enforces this with a token-level similarity check across the captured
  corpus.
- Do not name real products, customers, or competitors in generated copy
  unless the user has explicitly provided those names.
