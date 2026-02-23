"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle } from "lucide-react";

interface BottleneckCase {
  caseId: string;
  caseNumber: string;
  title: string;
  stageName: string;
  maxDurationDays: number | null;
  daysInStage: number;
  clientName: string;
}

interface Props {
  data: BottleneckCase[];
}

export function BottleneckTable({ data }: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Overdue Cases
            </CardTitle>
            <CardDescription className="text-xs">
              Cases exceeding their stage duration limit
            </CardDescription>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">
            No overdue cases — all within stage limits
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Case</TableHead>
                  <TableHead className="text-xs">Stage</TableHead>
                  <TableHead className="text-xs text-right">Days</TableHead>
                  <TableHead className="text-xs text-right">Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.caseId}>
                    <TableCell className="py-2">
                      <Link
                        href={`/cases/${row.caseId}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {row.caseNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {row.title}
                      </p>
                    </TableCell>
                    <TableCell className="py-2 text-sm">
                      {row.stageName}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-right text-red-600 font-medium">
                      {row.daysInStage}d
                    </TableCell>
                    <TableCell className="py-2 text-sm text-right text-muted-foreground">
                      {row.maxDurationDays}d
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
