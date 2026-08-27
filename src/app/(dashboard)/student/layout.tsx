import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
          <Button variant="ghost" className="justify-start" render={<Link href="/student" />}>
            Overview
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/student/marks" />}>
            Marks
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/student/meetings" />}>
            Meetings
          </Button>
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  );
}
