// ═══════════════════════════════════════════════════════════════════════════════
// service SECTION — Shared scroll timeline constants
// TitleSlide no longer lives in this section — it now lives in HeroSection.
// TIMELINE.split therefore owns the full 0.0 → 1.0 scroll range.
// ═══════════════════════════════════════════════════════════════════════════════

export const cinematicEase: [number, number, number, number] = [0.76, 0, 0.24, 1];

export const TIMELINE = {
  split: { start: 0.0, enterEnd: 0.05, holdEnd: 0.92, end: 1.0 },
} as const;