import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, Mentor!</CardTitle>
          <CardDescription>Track your mentees' progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View your upcoming mentoring sessions and feedback.</p>
        </CardContent>
      </Card>
    </div>
  );
}
