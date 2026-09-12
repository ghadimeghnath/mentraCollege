import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance Management</h2>
        <p className="text-muted-foreground">Mark and monitor student attendance for your assigned classes and subjects.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance</CardTitle>
          <CardDescription>Select a class and subject to record daily attendance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a class to begin marking attendance.</p>
        </CardContent>
      </Card>
    </div>
  );
}
