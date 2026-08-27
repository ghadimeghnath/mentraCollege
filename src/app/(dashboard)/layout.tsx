import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/features/auth/components/SignOutButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-primary">Mentra</h1>
            {session?.user && (
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md capitalize">
                {session.user.role.toLowerCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="text-sm font-medium hidden sm:inline-block">
                {session.user.email}
              </span>
            )}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
