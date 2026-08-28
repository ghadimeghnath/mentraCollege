import { prisma } from "@/lib/prisma/client";
import { SubjectManager } from "@/features/admin/components/SubjectManager";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany();
  
  const classes = await prisma.class.findMany({ 
    include: { 
      department: true, 
      level: true, 
      division: true,
      academicYear: true
    } 
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Subjects Management</h2>
        <p className="text-muted-foreground">Manage subjects and assign them to classes.</p>
      </div>

      <SubjectManager initialSubjects={subjects} classes={classes} />
    </div>
  );
}
