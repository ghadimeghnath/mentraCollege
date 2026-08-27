import { LoginForm } from "@/features/auth/components/LoginForm";
import { notFound } from "next/navigation";

const ALLOWED_ROLES = ["admin", "teacher", "mentor", "student", "parent"];

export default async function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
  const resolvedParams = await params;
  const role = resolvedParams.role.toLowerCase();
  
  if (!ALLOWED_ROLES.includes(role)) {
    notFound();
  }

  // Capitalize the role for display
  const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary">Mentra</h1>
        <p className="text-muted-foreground mt-2">Education Management System</p>
      </div>
      <LoginForm expectedRole={displayRole} />
    </div>
  );
}
