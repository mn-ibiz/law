"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRolePermissions } from "@/lib/actions/permissions";
import type { Resource, Action } from "@/lib/auth/permissions";

const ALL_RESOURCES: { resource: Resource; label: string }[] = [
  { resource: "attorneys", label: "Attorneys" },
  { resource: "clients", label: "Clients" },
  { resource: "cases", label: "Cases" },
  { resource: "documents", label: "Documents" },
  { resource: "calendar", label: "Calendar" },
  { resource: "time-tracking", label: "Time Tracking" },
  { resource: "expenses", label: "Expenses" },
  { resource: "billing", label: "Billing" },
  { resource: "trust-accounts", label: "Trust Accounts" },
  { resource: "messages", label: "Messages" },
  { resource: "reports", label: "Reports" },
  { resource: "settings", label: "Settings" },
  { resource: "audit-log", label: "Audit Log" },
  { resource: "users", label: "Users" },
];

const ALL_ACTIONS: Action[] = ["create", "read", "update", "delete", "export"];

type PermMap = Record<string, Partial<Record<Resource, Action[]>>>;

interface Props {
  initialPermissions: PermMap;
}

export function PermissionsManager({ initialPermissions }: Props) {
  const [perms, setPerms] = useState<PermMap>(initialPermissions);
  const [isPending, startTransition] = useTransition();

  function hasAction(role: string, resource: Resource, action: Action) {
    return perms[role]?.[resource]?.includes(action) ?? false;
  }

  function toggleAction(role: string, resource: Resource, action: Action) {
    setPerms((prev) => {
      const rolePerms = { ...prev[role] };
      const actions = [...(rolePerms[resource] ?? [])];
      const idx = actions.indexOf(action);
      if (idx >= 0) {
        actions.splice(idx, 1);
      } else {
        actions.push(action);
      }
      if (actions.length === 0) {
        delete rolePerms[resource];
      } else {
        rolePerms[resource] = actions;
      }
      return { ...prev, [role]: rolePerms };
    });
  }

  function handleSave(role: "attorney" | "client") {
    const rolePerms = perms[role] ?? {};
    const permissions = Object.entries(rolePerms)
      .filter(([, actions]) => actions && actions.length > 0)
      .map(([resource, actions]) => ({ resource, actions }));

    startTransition(async () => {
      const result = await updateRolePermissions({ role, permissions });
      if (result && "error" in result) {
        toast.error(result.error as string);
      } else {
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} permissions updated`);
      }
    });
  }

  function renderRoleTab(role: "attorney" | "client") {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {role === "attorney" ? "Attorney" : "Client"} Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left font-medium text-muted-foreground">
                    Resource
                  </th>
                  {ALL_ACTIONS.map((action) => (
                    <th
                      key={action}
                      className="px-3 py-2 text-center font-medium capitalize text-muted-foreground"
                    >
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_RESOURCES.map(({ resource, label }) => (
                  <tr key={resource} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{label}</td>
                    {ALL_ACTIONS.map((action) => (
                      <td key={action} className="px-3 py-2.5 text-center">
                        <Checkbox
                          checked={hasAction(role, resource, action)}
                          onCheckedChange={() => toggleAction(role, resource, action)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleSave(role)} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="attorney">
      <TabsList>
        <TabsTrigger value="attorney">Attorney</TabsTrigger>
        <TabsTrigger value="client">Client</TabsTrigger>
      </TabsList>
      <TabsContent value="attorney" className="mt-4">
        {renderRoleTab("attorney")}
      </TabsContent>
      <TabsContent value="client" className="mt-4">
        {renderRoleTab("client")}
      </TabsContent>
    </Tabs>
  );
}
