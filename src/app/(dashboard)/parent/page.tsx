import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, Parent!</CardTitle>
          <CardDescription>Stay updated on your child's progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Check academic performance and attendance records.</p>
        </CardContent>
      </Card>
    </div>
  );
}
