interface CpdProgressBarProps {
  totalUnits: number;
  lskProgramUnits: number;
  requiredTotal: number;
  requiredLsk: number;
}

export function CpdProgressBar({
  totalUnits,
  lskProgramUnits,
  requiredTotal,
  requiredLsk,
}: CpdProgressBarProps) {
  const totalPct = Math.min((totalUnits / requiredTotal) * 100, 100);
  const lskPct = Math.min((lskProgramUnits / requiredLsk) * 100, 100);
  const isTotalMet = totalUnits >= requiredTotal;
  const isLskMet = lskProgramUnits >= requiredLsk;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Total CPD Units</span>
          <span className={isTotalMet ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {totalUnits} / {requiredTotal}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isTotalMet ? "bg-green-500" : totalPct >= 60 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${totalPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>LSK Program Units</span>
          <span className={isLskMet ? "text-green-600 font-medium" : "text-muted-foreground"}>
            {lskProgramUnits} / {requiredLsk}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isLskMet ? "bg-green-500" : lskPct >= 50 ? "bg-amber-500" : "bg-red-500"
            }`}
            style={{ width: `${lskPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
