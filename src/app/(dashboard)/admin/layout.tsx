import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
          <Button variant="ghost" className="justify-start" render={<Link href="/admin" />}>
            Overview
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/admin/users" />}>
            Users
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/admin/mentorship" />}>
            Mentorship
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/admin/subjects" />}>
            Subjects
          </Button>
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  );
}
