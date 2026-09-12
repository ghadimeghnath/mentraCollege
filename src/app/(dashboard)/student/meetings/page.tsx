import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentMeetingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mentorship Meetings</h2>
        <p className="text-muted-foreground">Check schedules for upcoming meetings with your assigned mentor.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Meetings</CardTitle>
          <CardDescription>View upcoming mentor interaction slots and guidance sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No scheduled meetings at this time.</p>
        </CardContent>
      </Card>
    </div>
  );
}
