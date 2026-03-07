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
  mediation: "bg-amber-500",
  arbitration: "bg-indigo-500",
  filing_deadline: "bg-orange-500",
  client_meeting: "bg-cyan-500",
  internal_meeting: "bg-sky-500",
  court_mention: "bg-pink-500",
  site_visit: "bg-emerald-500",
  training: "bg-violet-500",
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
  mediation: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  arbitration: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  filing_deadline: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20",
  client_meeting: "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20",
  internal_meeting: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
  court_mention: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-600/20",
  site_visit: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  training: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
  other: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-500/20",
};

/** Bold block colors for month grid — vivid backgrounds with strong left borders */
export const EVENT_BLOCK_COLORS: Record<string, string> = {
  court_hearing: "bg-red-500/15 border-l-red-500 text-red-900 dark:bg-red-500/20 dark:text-red-200",
  meeting: "bg-blue-500/15 border-l-blue-500 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200",
  deposition: "bg-purple-500/15 border-l-purple-500 text-purple-900 dark:bg-purple-500/20 dark:text-purple-200",
  deadline: "bg-rose-500/15 border-l-rose-500 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200",
  reminder: "bg-slate-500/10 border-l-slate-400 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300",
  consultation: "bg-teal-500/15 border-l-teal-500 text-teal-900 dark:bg-teal-500/20 dark:text-teal-200",
  mediation: "bg-amber-500/15 border-l-amber-500 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200",
  arbitration: "bg-indigo-500/15 border-l-indigo-500 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200",
  filing_deadline: "bg-orange-500/15 border-l-orange-500 text-orange-900 dark:bg-orange-500/20 dark:text-orange-200",
  client_meeting: "bg-cyan-500/15 border-l-cyan-500 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200",
  internal_meeting: "bg-sky-500/15 border-l-sky-500 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200",
  court_mention: "bg-pink-500/15 border-l-pink-500 text-pink-900 dark:bg-pink-500/20 dark:text-pink-200",
  site_visit: "bg-emerald-500/15 border-l-emerald-500 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200",
  training: "bg-violet-500/15 border-l-violet-500 text-violet-900 dark:bg-violet-500/20 dark:text-violet-200",
  other: "bg-gray-500/10 border-l-gray-400 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
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
