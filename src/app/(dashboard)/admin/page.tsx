import { Suspense } from "react";
import { getDepartmentsWithPrograms, getPrograms } from "@/features/admin/actions/hierarchy";
import { getAcademicYears } from "@/features/admin/actions/academic";
import { getFaculties } from "@/features/admin/actions/faculty";
import { getSubjects } from "@/features/admin/actions/subject";
import { AcademicCommandCenter } from "@/features/admin/components/AcademicCommandCenter";

export default async function AdminDashboardPage() {
  const [academicYears, departments, programs, faculties, subjects] =
    await Promise.all([
      getAcademicYears(),
      getDepartmentsWithPrograms(),
      getPrograms(),
      getFaculties(),
      getSubjects(),
    ]);

  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground text-sm">Loading Academic Setup...</div>}>
      <AcademicCommandCenter
        academicYears={academicYears}
        departments={departments}
        programs={programs}
        subjects={subjects}
        faculties={faculties}
      />
    </Suspense>
  );
}
