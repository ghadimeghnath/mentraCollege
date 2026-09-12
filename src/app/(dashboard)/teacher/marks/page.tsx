import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherMarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Marks Entry</h2>
        <p className="text-muted-foreground">Input and update test scores, assignments, and exam results.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Assessment Scoring</CardTitle>
          <CardDescription>Select a class and subject to enter or modify student marks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select a class to start grading.</p>
        </CardContent>
      </Card>
    </div>
  );
}
