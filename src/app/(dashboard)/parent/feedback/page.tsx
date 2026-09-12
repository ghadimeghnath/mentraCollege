import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentFeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Parent Feedback</h2>
        <p className="text-muted-foreground">Submit feedback or communicate with teachers and mentors.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback & Communications</CardTitle>
          <CardDescription>Share your queries or feedback regarding your ward's progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active feedback submissions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
