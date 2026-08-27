import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, Admin!</CardTitle>
          <CardDescription>Here is an overview of your platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Select an option from the sidebar to manage users, roles, or settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}
