import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorRemarksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mentorship Remarks</h2>
        <p className="text-muted-foreground">Record observations, behavioral remarks, and student guidance notes.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Student Remarks</CardTitle>
          <CardDescription>Recent notes and evaluations for your mentees.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No remarks recorded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
