import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorMenteesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Assigned Mentees</h2>
        <p className="text-muted-foreground">View and monitor the progress of your assigned students.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mentee Roster</CardTitle>
          <CardDescription>List of all students under your mentorship guidance.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No mentees currently assigned.</p>
        </CardContent>
      </Card>
    </div>
  );
}
