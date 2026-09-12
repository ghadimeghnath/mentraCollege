import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teacher Feedback</h2>
        <p className="text-muted-foreground">Provide feedback to students and review notes from mentors and parents.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Feedback</CardTitle>
          <CardDescription>Enter subject-level feedback and observations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pending feedback entries.</p>
        </CardContent>
      </Card>
    </div>
  );
}
