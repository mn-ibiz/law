"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Pause, Square, Clock, X, ChevronDown, ChevronUp } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { createTimeEntry } from "@/lib/actions/time-expenses";
import { cn } from "@/lib/utils";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

interface TimerCase {
  id: string;
  caseNumber: string;
  title: string;
}

interface TimerWidgetProps {
  cases: TimerCase[];
}

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  accumulatedMs: number;
  selectedCaseId: string;
  description: string;
}

function loadTimerState(storageKey: string): TimerState {
  if (typeof window === "undefined") {
    return {
      isRunning: false,
      startTime: null,
      accumulatedMs: 0,
      selectedCaseId: "",
      description: "",
    };
  }
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return {
    isRunning: false,
    startTime: null,
    accumulatedMs: 0,
    selectedCaseId: "",
    description: "",
  };
}

function saveTimerState(storageKey: string, state: TimerState) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function TimerWidget({ cases }: TimerWidgetProps) {
  const { organizationId } = useOrgConfig();
  const storageKey = `${organizationId}:law-firm-timer`;
  const [initial] = useState<TimerState>(() => loadTimerState(storageKey));

  const [isRunning, setIsRunning] = useState(initial.isRunning);
  const [startTime, setStartTime] = useState<number | null>(initial.startTime);
  const [accumulatedMs, setAccumulatedMs] = useState(initial.accumulatedMs);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.floor(initial.accumulatedMs / 1000)
  );
  const [selectedCaseId, setSelectedCaseId] = useState(initial.selectedCaseId);
  const [description, setDescription] = useState(initial.description);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(initial.isRunning || initial.accumulatedMs > 0);

  const { execute, isPending } = useAction(createTimeEntry, {
    successMessage: "Time entry saved",
    onSuccess: () => {
      // Reset timer
      setIsRunning(false);
      setStartTime(null);
      setAccumulatedMs(0);
      setElapsedSeconds(0);
      setDescription("");
      setSelectedCaseId("");
      localStorage.removeItem(storageKey);
    },
  });

  // Persist state changes
  useEffect(() => {
    saveTimerState(storageKey, {
      isRunning,
      startTime,
      accumulatedMs,
      selectedCaseId,
      description,
    });
  }, [isRunning, startTime, accumulatedMs, selectedCaseId, description, storageKey]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || !startTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const totalMs = accumulatedMs + (now - startTime);
      setElapsedSeconds(Math.floor(totalMs / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime, accumulatedMs]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setStartTime(Date.now());
    setIsVisible(true);
    setElapsedSeconds(Math.floor(accumulatedMs / 1000));
  }, [accumulatedMs]);

  const handlePause = useCallback(() => {
    if (startTime) {
      const delta = Date.now() - startTime;
      setAccumulatedMs((prev) => {
        const next = prev + delta;
        setElapsedSeconds(Math.floor(next / 1000));
        return next;
      });
    }
    setIsRunning(false);
    setStartTime(null);
  }, [startTime]);

  const handleStop = useCallback(() => {
    // Calculate final accumulated time
    let totalMs = accumulatedMs;
    if (isRunning && startTime) {
      totalMs += Date.now() - startTime;
    }
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedMs(totalMs);
    setElapsedSeconds(Math.floor(totalMs / 1000));

    const hours = totalMs / (1000 * 60 * 60);
    if (hours < 0.01) return; // Less than ~36 seconds, skip

    if (!selectedCaseId) return;

    execute({
      caseId: selectedCaseId,
      description: description || "Timer entry",
      date: new Date().toISOString().slice(0, 10),
      hours: Math.round(hours * 100) / 100,
      isBillable: true,
    });
  }, [accumulatedMs, isRunning, startTime, selectedCaseId, description, execute]);

  const handleDiscard = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedMs(0);
    setElapsedSeconds(0);
    setDescription("");
    setSelectedCaseId("");
    setIsVisible(false);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="sm"
          onClick={() => setIsVisible(true)}
          className="rounded-full shadow-lg h-10 w-10 p-0"
        >
          <Clock className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-72 shadow-xl border">
        <CardContent className="p-3 space-y-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Timer</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDiscard}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Timer display */}
          <div className="text-center">
            <p
              className={cn(
                "text-2xl font-mono font-bold tabular-nums",
                isRunning && "text-primary"
              )}
            >
              {formatElapsed(elapsedSeconds)}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={handleStart}
                className="h-8 px-3"
              >
                <Play className="h-3.5 w-3.5 mr-1" />
                {accumulatedMs > 0 ? "Resume" : "Start"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handlePause}
                className="h-8 px-3"
              >
                <Pause className="h-3.5 w-3.5 mr-1" />
                Pause
              </Button>
            )}
            {(isRunning || accumulatedMs > 0) && (
              <Button
                size="sm"
                variant="destructive"
                onClick={handleStop}
                disabled={isPending || !selectedCaseId}
                className="h-8 px-3"
              >
                <Square className="h-3.5 w-3.5 mr-1" />
                {isPending ? "Saving..." : "Save"}
              </Button>
            )}
          </div>

          {/* Inputs (collapsible) */}
          {!isMinimized && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="timer-case" className="text-xs">
                  Case
                </Label>
                <Select
                  value={selectedCaseId}
                  onValueChange={setSelectedCaseId}
                >
                  <SelectTrigger id="timer-case" className="h-8 text-xs">
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.caseNumber} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="timer-desc" className="text-xs">
                  Description
                </Label>
                <Input
                  id="timer-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
