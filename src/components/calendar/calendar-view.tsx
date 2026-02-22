"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { formatEnum } from "@/lib/utils/format-enum";
import { APP_LOCALE } from "@/lib/constants/locale";

interface CalendarEvent {
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

interface Deadline {
  id: string;
  title: string;
  priority: string;
  dueDate: Date;
  completedAt: Date | null;
  isStatutory: boolean;
  caseNumber: string | null;
  assignedToName: string | null;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  deadlines: Deadline[];
}

const typeColors: Record<string, string> = {
  court_hearing: "text-red-600",
  meeting: "text-blue-600",
  deadline: "text-amber-600",
  reminder: "text-gray-600",
  consultation: "text-green-600",
  deposition: "text-purple-600",
  other: "text-gray-500",
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "default",
  critical: "destructive",
};

export function CalendarView({ events, deadlines }: CalendarViewProps) {
  const upcomingEvents = events
    .filter((e) => new Date(e.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 20);

  const pendingDeadlines = deadlines
    .filter((d) => !d.completedAt)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                  <div className={`mt-0.5 ${typeColors[event.type] || "text-gray-500"}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.startTime).toLocaleString(APP_LOCALE, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {event.isCourtDate && (
                        <Badge variant="destructive" className="text-xs">Court</Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {formatEnum(event.type)}
                      </Badge>
                    </div>
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Pending Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending deadlines.</p>
          ) : (
            <div className="space-y-3">
              {pendingDeadlines.map((dl) => {
                const isOverdue = new Date(dl.dueDate) < new Date();
                return (
                  <div
                    key={dl.id}
                    className={`flex items-start justify-between border-b pb-3 last:border-0 ${
                      isOverdue ? "text-destructive" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{dl.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(dl.dueDate).toLocaleDateString(APP_LOCALE)}
                        </span>
                        {dl.caseNumber && (
                          <span className="text-xs font-mono text-muted-foreground">
                            {dl.caseNumber}
                          </span>
                        )}
                        {dl.isStatutory && (
                          <Badge variant="destructive" className="text-xs">Statutory</Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant={priorityVariant[dl.priority] ?? "secondary"}>
                      {dl.priority}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
