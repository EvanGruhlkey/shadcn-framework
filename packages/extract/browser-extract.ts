/**
 * Browser-side token harvester.
 *
 * The exported `harvestTokens` is serialized by Playwright and run inside
 * the page via `page.evaluate`. It walks the rendered DOM, collects
 * computed styles, and returns a JSON-serializable raw observations
 * record. It does NOT capture HTML, scripts, or third-party assets — it
 * only reports values the browser already computed.
 *
 * The function is written as a single self-contained block so Playwright
 * can serialize it without surprises. Helpers are inlined.
 */

import type { Page } from "playwright";

import type { RawTokens } from "./types.js";

/** Public entry: invoke the harvester inside the page. */
export async function harvestTokens(
  page: Page,
  url: string,
  viewport: { width: number; height: number },
): Promise<RawTokens> {
  // tsx/esbuild transpiles nested function declarations with a `__name`
  // helper for nicer stack traces. Playwright serializes the function to
  // a string and evaluates it in the browser, where `__name` is
  // undefined. Define it as an identity function before invoking the
  // harvester so the wrapped declarations resolve cleanly.
  await page.evaluate(() => {
    const g = globalThis as unknown as { __name?: (fn: unknown) => unknown };
    if (typeof g.__name === "undefined") g.__name = (fn: unknown) => fn;
  });

  const partial = await page.evaluate(harvestInPage);
  return {
    url,
    capturedAt: new Date().toISOString(),
    viewport,
    ...partial,
  };
}

/**
 * The harvester. Plain JS so Playwright can serialize it.
 * Intentionally kept dependency-free.
 */
function harvestInPage(): Omit<RawTokens, "url" | "capturedAt" | "viewport"> {
  const colorObs: Array<{
    hex: string;
    role: "text" | "background" | "border" | "shadow";
    area: number;
  }> = [];
  const typeAgg = new Map<
    string,
    {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
      lineHeight: number;
      letterSpacing: number;
      count: number;
    }
  >();
  const spacingAgg = new Map<string, { axis: "padding" | "gap" | "margin"; px: number; count: number }>();
  const radiiAgg = new Map<number, number>();
  const shadowsAgg = new Map<string, number>();

  const all = document.querySelectorAll<HTMLElement>("body *");

  /* ---------------- color helpers ---------------- */
  const toHex = (rgb: string): string | null => {
    if (!rgb || rgb === "transparent") return null;
    const m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1]!.split(",").map((s) => s.trim());
    const r = parseInt(parts[0]!, 10);
    const g = parseInt(parts[1]!, 10);
    const b = parseInt(parts[2]!, 10);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (a < 0.05) return null;
    if ([r, g, b].some((n) => Number.isNaN(n))) return null;
    const h = (n: number) => n.toString(16).padStart(2, "0");
    return `#${h(r)}${h(g)}${h(b)}`;
  };

  const recordColor = (
    hex: string | null,
    role: "text" | "background" | "border" | "shadow",
    area: number,
  ) => {
    if (!hex || area <= 0) return;
    colorObs.push({ hex, role, area });
  };

  /* ---------------- spacing helpers ---------------- */
  const recordSpacing = (axis: "padding" | "gap" | "margin", px: number) => {
    if (!Number.isFinite(px) || px <= 0 || px > 256) return;
    const key = `${axis}:${Math.round(px)}`;
    const existing = spacingAgg.get(key);
    if (existing) existing.count += 1;
    else spacingAgg.set(key, { axis, px: Math.round(px), count: 1 });
  };

  /* ---------------- container width tracking ------- */
  let dominantContainerPx: number | null = null;
  let dominantContainerArea = 0;

  /* ---------------- main pass ---------------- */
  for (const el of Array.from(all)) {
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const area = rect.width * rect.height;

    // Background
    recordColor(toHex(style.backgroundColor), "background", area);

    // Border (read each side; the four-side shorthand is typical)
    const borderColor = toHex(style.borderTopColor);
    const borderWidth =
      parseFloat(style.borderTopWidth) || parseFloat(style.borderBottomWidth) || 0;
    if (borderWidth > 0) recordColor(borderColor, "border", borderWidth * (rect.width + rect.height) * 2);

    // Box shadow color
    const shadow = style.boxShadow;
    if (shadow && shadow !== "none") {
      shadowsAgg.set(shadow, (shadowsAgg.get(shadow) ?? 0) + 1);
      const colorMatch = shadow.match(/rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}/);
      if (colorMatch) recordColor(toHex(colorMatch[0]), "shadow", area * 0.05);
    }

    // Text content + color (only if the element has direct text)
    const directText = directTextLength(el);
    if (directText > 0) {
      const fontSize = parseFloat(style.fontSize) || 16;
      const textArea = directText * fontSize * fontSize * 0.45;
      recordColor(toHex(style.color), "text", textArea);

      const fontFamily = simplifyFontFamily(style.fontFamily);
      const fontWeight = normalizeWeight(style.fontWeight);
      const lineHeight =
        style.lineHeight === "normal"
          ? Math.round(fontSize * 1.4)
          : parseFloat(style.lineHeight) || Math.round(fontSize * 1.4);
      const letterSpacing =
        style.letterSpacing === "normal" ? 0 : parseFloat(style.letterSpacing) || 0;

      const k = `${fontFamily}|${fontSize}|${fontWeight}`;
      const existing = typeAgg.get(k);
      if (existing) existing.count += directText;
      else
        typeAgg.set(k, {
          fontFamily,
          fontSize: Math.round(fontSize),
          fontWeight,
          lineHeight: Math.round(lineHeight),
          letterSpacing,
          count: directText,
        });
    }

    // Spacing
    for (const side of ["padding-top", "padding-right", "padding-bottom", "padding-left"]) {
      recordSpacing("padding", parseFloat(style.getPropertyValue(side)));
    }
    if ((style as CSSStyleDeclaration).gap) recordSpacing("gap", parseFloat(style.gap));
    if ((style as CSSStyleDeclaration).rowGap)
      recordSpacing("gap", parseFloat(style.rowGap));
    if ((style as CSSStyleDeclaration).columnGap)
      recordSpacing("gap", parseFloat(style.columnGap));

    // Border radius
    const radius = parseFloat(style.borderTopLeftRadius);
    if (Number.isFinite(radius) && radius > 0 && radius < 64) {
      const r = Math.round(radius);
      radiiAgg.set(r, (radiiAgg.get(r) ?? 0) + 1);
    }

    // Container candidate: a wide horizontally-centered block element
    const tag = el.tagName;
    const isLayout =
      tag === "MAIN" || tag === "SECTION" || tag === "DIV" || tag === "ARTICLE";
    if (
      isLayout &&
      rect.width >= 720 &&
      rect.width <= 1600 &&
      rect.height >= 200 &&
      area > dominantContainerArea
    ) {
      dominantContainerArea = area;
      dominantContainerPx = Math.round(rect.width);
    }
  }

  return {
    colors: colorObs,
    typography: Array.from(typeAgg.values()),
    spacing: Array.from(spacingAgg.values()),
    radii: Array.from(radiiAgg, ([px, count]) => ({ px, count })),
    shadows: Array.from(shadowsAgg, ([value, count]) => ({ value, count })),
    dominantContainerPx,
  };

  /* ----- inlined helpers ----- */

  function directTextLength(el: Element): number {
    let total = 0;
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3) {
        const text = (child.nodeValue ?? "").trim();
        if (text) total += text.length;
      }
    }
    return total;
  }

  function simplifyFontFamily(raw: string): string {
    if (!raw) return "system-ui";
    const first = raw.split(",")[0]!.trim().replace(/^["']|["']$/g, "");
    return first || "system-ui";
  }

  function normalizeWeight(raw: string): number {
    const named: Record<string, number> = {
      normal: 400,
      bold: 700,
      lighter: 300,
      bolder: 700,
    };
    if (named[raw] !== undefined) return named[raw]!;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) return Math.max(100, Math.min(900, n));
    return 400;
  }
}
