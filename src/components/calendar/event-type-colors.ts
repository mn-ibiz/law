/**
 * Shared event type color definitions for calendar components.
 * Maps DB event_type enum values to Tailwind color classes.
 */

/** Dot colors for month grid and list view */
export const EVENT_DOT_COLORS: Record<string, string> = {
  court_hearing: "bg-red-500",
  meeting: "bg-blue-500",
  deposition: "bg-purple-500",
  deadline: "bg-rose-500",
  reminder: "bg-slate-400",
  consultation: "bg-teal-500",
  other: "bg-slate-400",
};

/** Badge styles for event type labels */
export const EVENT_TYPE_BADGE_STYLES: Record<string, string> = {
  court_hearing: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  meeting: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  deposition: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  deadline: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  reminder: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20",
  consultation: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20",
  other: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

/** Block colors for week view event blocks */
export const EVENT_BLOCK_COLORS: Record<string, string> = {
  court_hearing: "bg-red-100 border-red-300 text-red-800",
  meeting: "bg-blue-100 border-blue-300 text-blue-800",
  deposition: "bg-purple-100 border-purple-300 text-purple-800",
  deadline: "bg-rose-100 border-rose-300 text-rose-800",
  reminder: "bg-slate-100 border-slate-300 text-slate-700",
  consultation: "bg-teal-100 border-teal-300 text-teal-800",
  other: "bg-gray-100 border-gray-300 text-gray-700",
};

export function getDotColor(type: string): string {
  return EVENT_DOT_COLORS[type] ?? EVENT_DOT_COLORS.other;
}

export function getBadgeStyle(type: string): string {
  return EVENT_TYPE_BADGE_STYLES[type] ?? EVENT_TYPE_BADGE_STYLES.other;
}

export function getBlockColor(type: string): string {
  return EVENT_BLOCK_COLORS[type] ?? EVENT_BLOCK_COLORS.other;
}
