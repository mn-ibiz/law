"use client";

import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { changeUserRole, toggleUserActive } from "@/lib/actions/settings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, User, Briefcase, ToggleLeft, ToggleRight } from "lucide-react";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  isActive: boolean;
  isSelf: boolean;
}

const roles = [
  { value: "admin", label: "Admin", icon: Shield },
  { value: "attorney", label: "Attorney", icon: Briefcase },
  { value: "client", label: "Client", icon: User },
] as const;

export function UserActions({ userId, currentRole, isActive, isSelf }: UserActionsProps) {
  const router = useRouter();

  const { execute: executeRoleChange, isPending: isChangingRole } = useAction(
    (data: { role: string }) => changeUserRole(userId, data),
    { successMessage: "Role updated", onSuccess: () => router.refresh() }
  );

  const { execute: executeToggle, isPending: isToggling } = useAction(toggleUserActive, {
    successMessage: isActive ? "User deactivated" : "User activated",
    onSuccess: () => router.refresh(),
  });

  if (isSelf) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((role) => {
          const Icon = role.icon;
          const isCurrentRole = currentRole === role.value;
          return (
            <DropdownMenuItem
              key={role.value}
              disabled={isCurrentRole || isChangingRole}
              onClick={() => executeRoleChange({ role: role.value })}
              className={isCurrentRole ? "font-semibold" : ""}
            >
              <Icon className="mr-2 h-3.5 w-3.5" />
              {isCurrentRole ? `${role.label} (current)` : `Set as ${role.label}`}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => executeToggle(userId)}
          disabled={isToggling}
          className={!isActive ? "" : "text-destructive focus:text-destructive"}
        >
          {isActive ? (
            <>
              <ToggleLeft className="mr-2 h-3.5 w-3.5" />
              Deactivate User
            </>
          ) : (
            <>
              <ToggleRight className="mr-2 h-3.5 w-3.5" />
              Activate User
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
