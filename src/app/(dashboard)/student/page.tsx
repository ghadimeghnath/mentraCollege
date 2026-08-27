import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, Student!</CardTitle>
          <CardDescription>Here is your learning overview.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Check your upcoming classes and recent assignments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
