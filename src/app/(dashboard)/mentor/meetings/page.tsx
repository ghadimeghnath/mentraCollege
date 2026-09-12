import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorMeetingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mentorship Meetings</h2>
        <p className="text-muted-foreground">Schedule and review meetings with your mentees.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Scheduled 1-on-1 and group mentoring sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Past Meeting History</CardTitle>
            <CardDescription>Review notes and attendance from previous sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No past meeting records found.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
