import { requireAdmin } from "@/lib/auth/get-session";
import { SupplierForm } from "@/components/suppliers/supplier-form";

export default async function NewSupplierPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add Supplier</h1>
        <p className="text-muted-foreground">
          Register a new vendor or supplier.
        </p>
      </div>
      <SupplierForm />
    </div>
  );
}
