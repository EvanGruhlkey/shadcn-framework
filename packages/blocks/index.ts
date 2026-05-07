/**
 * Public surface of @framework/blocks.
 *
 * Each named export corresponds to a `block_ref` in `pattern-atlas/*.json`.
 * Adding a new block here is a deliberate change — keep the export list and
 * the atlas in sync.
 */

export { SiteNav } from "./navigation/SiteNav.js";
export type { SiteNavProps, NavLink } from "./navigation/SiteNav.js";

export { HeroSplitCode } from "./hero/HeroSplitCode.js";
export type { HeroSplitCodeProps, HeroCodeTab } from "./hero/HeroSplitCode.js";

export { HeroAgentDemo } from "./hero/HeroAgentDemo.js";
export type { HeroAgentDemoProps, AgentTurn } from "./hero/HeroAgentDemo.js";

export { HeroEnterpriseSplit } from "./hero/HeroEnterpriseSplit.js";
export type { HeroEnterpriseSplitProps } from "./hero/HeroEnterpriseSplit.js";

export { LogoStripMono } from "./proof/LogoStripMono.js";
export type { LogoStripMonoProps, LogoMark } from "./proof/LogoStripMono.js";

export { QuoteCardsThree } from "./proof/QuoteCardsThree.js";
export type { QuoteCardsThreeProps, QuoteCardData } from "./proof/QuoteCardsThree.js";

export { FeatureGridThree } from "./feature-systems/FeatureGridThree.js";
export type { FeatureGridThreeProps, FeatureItem } from "./feature-systems/FeatureGridThree.js";

export { FeatureGridFour } from "./feature-systems/FeatureGridFour.js";
export type {
  FeatureGridFourProps,
  PlatformPillar,
} from "./feature-systems/FeatureGridFour.js";

export { FeatureDeepDive } from "./feature-systems/FeatureDeepDive.js";
export type { FeatureDeepDiveProps } from "./feature-systems/FeatureDeepDive.js";

export { UseCaseRoleGrid } from "./feature-systems/UseCaseRoleGrid.js";
export type {
  UseCaseRoleGridProps,
  UseCaseRole,
} from "./feature-systems/UseCaseRoleGrid.js";

export { PricingTierTable } from "./pricing/PricingTierTable.js";
export type {
  PricingTierTableProps,
  PricingTier,
} from "./pricing/PricingTierTable.js";

export { UsageCalculator } from "./pricing/UsageCalculator.js";
export type { UsageCalculatorProps, RateMeter } from "./pricing/UsageCalculator.js";

export { ConversionBand } from "./conversion/ConversionBand.js";
export type { ConversionBandProps } from "./conversion/ConversionBand.js";

export { Action, Button, Card, Section, Eyebrow, buttonClass } from "./_lib/primitives.js";
export { cn } from "./_lib/cn.js";
