import { prisma } from "@/lib/prisma/client";
import { AcademicYearManager } from "@/features/admin/components/AcademicYearManager";
import { ClassManager } from "@/features/admin/components/ClassManager";
import { DepartmentManager } from "@/features/admin/components/DepartmentManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminDashboardPage() {
  const academicYears = await prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } });
  
  const departments = await prisma.department.findMany();
  const levels = await prisma.academicLevel.findMany({ include: { department: true } });
  const divisions = await prisma.division.findMany({ include: { level: true } });
  
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
        <h2 className="text-2xl font-bold tracking-tight">Academic Setup</h2>
        <p className="text-muted-foreground">Manage academic years, departments, levels, and classes.</p>
      </div>

      <Tabs defaultValue="academic-year" className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
          <TabsTrigger value="academic-year">Academic Years</TabsTrigger>
          <TabsTrigger value="departments">Departments & Levels</TabsTrigger>
          <TabsTrigger value="classes">Divisions & Classes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="academic-year">
          <AcademicYearManager initialData={academicYears} />
        </TabsContent>
        
        <TabsContent value="departments">
          <DepartmentManager initialDepartments={departments} initialLevels={levels} />
        </TabsContent>
        
        <TabsContent value="classes">
          <ClassManager 
            initialClasses={classes} 
            initialDivisions={divisions} 
            departments={departments} 
            levels={levels} 
            academicYears={academicYears} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
