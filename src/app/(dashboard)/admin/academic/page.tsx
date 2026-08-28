import { getAcademicYears, getDepartments, getAcademicLevels, getDivisions, getClasses } from "@/features/admin/actions/academic";
import { getSubjects } from "@/features/admin/actions/subject";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicYearManager } from "@/features/admin/components/AcademicYearManager";
import { DepartmentManager } from "@/features/admin/components/DepartmentManager";
import { ClassManager } from "@/features/admin/components/ClassManager";
import { SubjectManager } from "@/features/admin/components/SubjectManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AcademicAdminPage() {
  const [academicYears, departments, levels, divisions, classes, subjects] = await Promise.all([
    getAcademicYears(),
    getDepartments(),
    getAcademicLevels(),
    getDivisions(),
    getClasses(),
    getSubjects()
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Academic Structure Management</h2>
        <p className="text-muted-foreground">Manage academic years, departments, classes, and subjects.</p>
      </div>

      <Tabs defaultValue="years" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="years">Years</TabsTrigger>
          <TabsTrigger value="departments">Depts</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="years">
          <Card>
            <CardHeader>
              <CardTitle>Academic Years</CardTitle>
              <CardDescription>Manage academic sessions. Only one year can be active at a time.</CardDescription>
            </CardHeader>
            <CardContent>
              <AcademicYearManager initialData={academicYears} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Departments & Levels</CardTitle>
              <CardDescription>Manage departments, programmes, and their academic levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentManager initialDepartments={departments} initialLevels={levels} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Classes & Divisions</CardTitle>
              <CardDescription>Configure classes and divisions based on your departments.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassManager 
                initialClasses={classes} 
                initialDivisions={divisions}
                departments={departments}
                levels={levels}
                academicYears={academicYears}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subject Configuration</CardTitle>
              <CardDescription>Create subjects and assign them to classes.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubjectManager 
                initialSubjects={subjects} 
                classes={classes}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
