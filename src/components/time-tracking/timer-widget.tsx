"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface TimerCase {
  id: string;
  caseNumber: string;
  title: string;
}

interface TimerWidgetProps {
  cases: TimerCase[];
}

const STORAGE_KEY = "law-firm-timer";

interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  accumulatedMs: number;
  selectedCaseId: string;
  description: string;
}

function loadTimerState(): TimerState {
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
    const stored = localStorage.getItem(STORAGE_KEY);
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

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedMs, setAccumulatedMs] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [description, setDescription] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const initialized = useRef(false);

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
      localStorage.removeItem(STORAGE_KEY);
    },
  });

  // Initialize from localStorage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const state = loadTimerState();
    setIsRunning(state.isRunning);
    setStartTime(state.startTime);
    setAccumulatedMs(state.accumulatedMs);
    setSelectedCaseId(state.selectedCaseId);
    setDescription(state.description);
    if (state.isRunning || state.accumulatedMs > 0) {
      setIsVisible(true);
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!initialized.current) return;
    saveTimerState({
      isRunning,
      startTime,
      accumulatedMs,
      selectedCaseId,
      description,
    });
  }, [isRunning, startTime, accumulatedMs, selectedCaseId, description]);

  // Timer tick
  useEffect(() => {
    if (!isRunning || !startTime) {
      const totalMs = accumulatedMs;
      setElapsedSeconds(Math.floor(totalMs / 1000));
      return;
    }
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
  }, []);

  const handlePause = useCallback(() => {
    if (startTime) {
      setAccumulatedMs((prev) => prev + (Date.now() - startTime));
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
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
