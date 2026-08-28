import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="lg:w-1/5">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
          <Button variant="ghost" className="justify-start" render={<Link href="/teacher" />} nativeButton={false}>
            Overview
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/teacher/attendance" />} nativeButton={false}>
            Attendance
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/teacher/marks" />} nativeButton={false}>
            Marks
          </Button>
          <Button variant="ghost" className="justify-start" render={<Link href="/teacher/feedback" />} nativeButton={false}>
            Feedback
          </Button>
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-4xl">{children}</div>
    </div>
  );
}
