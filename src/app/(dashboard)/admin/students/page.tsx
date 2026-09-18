import { getClasses, getAcademicYears } from "@/features/admin/actions/academic";
import { getPrograms } from "@/features/admin/actions/hierarchy";
import { getStudentsByClass } from "@/features/admin/actions/student";
import { StudentExcelUpload } from "@/features/admin/components/StudentExcelUpload";
import { StudentFilter } from "@/features/admin/components/StudentFilter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Suspense } from "react";

// In Next.js 15+, searchParams is a Promise.
export default async function StudentsAdminPage(props: {
  searchParams: Promise<{ classId?: string; yearId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const classes = await getClasses();
  const academicYears = await getAcademicYears();
  const programs = await getPrograms();

  const classId = searchParams?.classId;
  const yearId = searchParams?.yearId;
  
  let students: any[] = [];
  if (classId && yearId) {
    students = await getStudentsByClass(classId, yearId);
  }

  const selectedClass = classes.find(c => c.id === classId);
  const selectedYear = academicYears.find(y => y.id === yearId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
        <p className="text-muted-foreground">Manage student records and class enrollments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-[200px] border rounded-md animate-pulse bg-muted" />}>
          <StudentFilter classes={classes} academicYears={academicYears} programs={programs} />
        </Suspense>
        
        <Card>
          <CardHeader>
            <CardTitle>Bulk Import Students</CardTitle>
            <CardDescription>Upload an Excel file to import students into a specific class and academic year.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center">
            <StudentExcelUpload classes={classes} academicYears={academicYears} programs={programs} />
          </CardContent>
        </Card>
      </div>

      {classId && yearId ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Enrolled Students 
              {selectedClass && selectedYear && ` - ${selectedClass.name} (${selectedYear.name})`}
            </CardTitle>
            <CardDescription>
              {students.length} student(s) found in this class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Student ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {enrollment.student.rollNumber || "-"}
                        </TableCell>
                        <TableCell>
                          {enrollment.student.user.profile?.name || "-"}
                        </TableCell>
                        <TableCell>{enrollment.student.user.email}</TableCell>
                        <TableCell>
                          {enrollment.student.user.profile?.phone || "-"}
                        </TableCell>
                        <TableCell>
                          {enrollment.student.studentId || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                No students enrolled in this class for the selected academic year.
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Please select a class and an academic year in the filter above to view students.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
