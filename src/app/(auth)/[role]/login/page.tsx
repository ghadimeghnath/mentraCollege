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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="mb-8 text-center z-10 relative">
        <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm">Mentra</h1>
        <p className="text-muted-foreground mt-3 text-lg font-medium">Education Management System</p>
      </div>
      <div className="z-10 relative w-full max-w-md">
        <LoginForm expectedRole={displayRole} />
      </div>
    </div>
  );
}
