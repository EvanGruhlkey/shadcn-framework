/**
 * Viewport profiles used by the capture pipeline.
 *
 * Profiles are intentionally limited to three: desktop, tablet, mobile. Adding
 * more dilutes the analysis stage's classifier and makes it harder to reason
 * about which viewport produced which observation.
 */

export interface ViewportProfile {
  name: "desktop" | "tablet" | "mobile";
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
  hasTouch: boolean;
}

export const VIEWPORTS: Record<ViewportProfile["name"], ViewportProfile> = {
  desktop: {
    name: "desktop",
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  },
  tablet: {
    name: "tablet",
    width: 834,
    height: 1112,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  mobile: {
    name: "mobile",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
};

export function getViewport(name: ViewportProfile["name"]): ViewportProfile {
  return VIEWPORTS[name];
}
