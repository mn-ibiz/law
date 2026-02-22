import { requireAdmin } from "@/lib/auth/get-session";
import { getFirmSettings } from "@/lib/queries/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const SETTING_LABELS: Record<string, string> = {
  firm_name: "Firm Name",
  firm_email: "Email Address",
  firm_phone: "Phone Number",
  firm_address: "Physical Address",
  firm_po_box: "P.O. Box",
  firm_city: "City",
  firm_county: "County",
  firm_logo_url: "Logo URL",
  firm_website: "Website",
  firm_kra_pin: "KRA PIN",
  firm_lsk_number: "LSK Registration Number",
  primary_color: "Primary Brand Color",
  secondary_color: "Secondary Brand Color",
  vat_rate: "VAT Rate (%)",
  currency: "Default Currency",
  fiscal_year_start: "Fiscal Year Start",
  invoice_prefix: "Invoice Prefix",
  case_prefix: "Case Number Prefix",
};

export default async function FirmSettingsPage() {
  await requireAdmin();
  const settings = await getFirmSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Firm Settings</h1>
        <p className="text-muted-foreground">Firm name, branding, and general configuration.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Configuration</CardTitle></CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No firm settings configured. Add key-value pairs to customize your firm profile.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{SETTING_LABELS[setting.key] ?? setting.key}</p>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {setting.value ?? <span className="text-muted-foreground italic">Not set</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(setting.updatedAt).toLocaleDateString("en-KE")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
