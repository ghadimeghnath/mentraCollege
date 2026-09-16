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
    <div className="flex min-h-screen bg-background w-full">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex flex-1 relative bg-muted items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
          alt="Students learning together"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="z-10 flex flex-col items-center justify-center text-white p-12 text-center w-full h-full">
          <div className="max-w-lg">
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg">Empowering Education</h1>
            <p className="text-xl font-medium opacity-95 leading-relaxed drop-shadow-md">
              Join Mentra to manage, learn, and grow together in a comprehensive education ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-background via-muted/30 to-primary/5 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="mb-8 text-center z-10 relative">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm">Mentra</h1>
          <p className="text-muted-foreground mt-3 text-lg font-medium">Education Management System</p>
        </div>
        <div className="z-10 relative w-full max-w-md">
          <LoginForm expectedRole={displayRole} />
        </div>
      </div>
    </div>
  );
}
