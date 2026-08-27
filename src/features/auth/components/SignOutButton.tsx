"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/student/login" })}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign out
    </Button>
  );
}
