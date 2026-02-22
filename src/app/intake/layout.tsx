export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Client Intake Form</h1>
          <p className="mt-2 text-muted-foreground">
            Please fill out the form below to begin your consultation request.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
