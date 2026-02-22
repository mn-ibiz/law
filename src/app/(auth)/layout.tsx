import { Scale } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Scale className="mb-2 h-10 w-10" />
          <h1 className="text-2xl font-bold">Law Firm Registry</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
