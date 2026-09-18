"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Academic Setup", exact: true },
    { href: "/admin/students", label: "Students" },
    { href: "/admin/faculty", label: "Faculty" },
    { href: "/admin/mentorship", label: "Mentorship" },
  ];

  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5 lg:flex-shrink-0">
        <div className="lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-x-0 lg:space-y-2 pb-2 lg:pb-0">
            {navItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`justify-start ${isActive ? "bg-muted font-medium" : ""}`}
                  render={<Link href={item.href} />}
                  nativeButton={false}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
      <div className="flex-1 lg:max-w-4xl min-w-0">{children}</div>
    </div>
  );
}
