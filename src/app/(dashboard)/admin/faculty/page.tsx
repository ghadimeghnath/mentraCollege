import { getFaculties } from "@/features/admin/actions/faculty";
import { FacultyManager } from "@/features/admin/components/FacultyManager";
import { FacultyFilter } from "@/features/admin/components/FacultyFilter";
import { Suspense } from "react";

// In Next.js 15+, searchParams is a Promise.
export default async function FacultyAdminPage(props: {
  searchParams: Promise<{ search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const searchQuery = searchParams?.search;
  
  const faculties = await getFaculties(searchQuery);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faculty Management</h2>
        <p className="text-muted-foreground">Manage faculty records and subject assignments.</p>
      </div>
      
      <Suspense fallback={<div className="h-[200px] border rounded-md animate-pulse bg-muted" />}>
        <FacultyFilter />
      </Suspense>
      
      <FacultyManager initialFaculties={faculties} />
    </div>
  );
}
