import { redirect } from "next/navigation";

export default function SubjectAllocationsPage() {
  redirect("/admin?tab=allocations");
}
