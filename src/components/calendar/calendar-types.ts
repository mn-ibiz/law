/** Shared calendar event type used across all calendar components. */
export interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  isCourtDate: boolean;
  location: string | null;
  caseId: string | null;
}

/** Serialized version for passing from server to client components */
export interface SerializedCalendarEvent {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  isCourtDate: boolean;
  location: string | null;
  caseId: string | null;
}

export function serializeEvents(events: CalendarEvent[]): SerializedCalendarEvent[] {
  return events.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
  }));
}

export function deserializeEvent(e: SerializedCalendarEvent): CalendarEvent {
  return {
    ...e,
    startTime: new Date(e.startTime),
    endTime: new Date(e.endTime),
  };
}

export function deserializeEvents(events: SerializedCalendarEvent[]): CalendarEvent[] {
  return events.map(deserializeEvent);
}
