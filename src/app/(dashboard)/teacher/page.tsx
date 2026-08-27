import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, Teacher!</CardTitle>
          <CardDescription>Manage your classes and students.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">View your schedule and grade pending assignments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
