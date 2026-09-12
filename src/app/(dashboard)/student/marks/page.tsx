import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentMarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Academic Marks</h2>
        <p className="text-muted-foreground">View your exam results, internal assessments, and grade history.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assessment Overview</CardTitle>
          <CardDescription>Current semester marks and progress reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No marks recorded for the current term.</p>
        </CardContent>
      </Card>
    </div>
  );
}
