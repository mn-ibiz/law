import { requireAdminOrAttorney } from "@/lib/auth/get-session";
import { getDocumentTemplates } from "@/lib/queries/documents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DocumentTemplatesPage() {
  await requireAdminOrAttorney();
  const templates = await getDocumentTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Document Templates</h1>
        <p className="text-muted-foreground">Reusable templates for common documents.</p>
      </div>
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No templates created yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="text-lg">{t.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">{t.category.replace("_", " ")}</Badge>
                {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
