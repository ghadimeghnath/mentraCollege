"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createAcademicYear,
  setAcademicYearActive,
} from "../actions/academic";
import {
  getSemesters,
  updateSemester,
  toggleTermTypeSemesters,
} from "../actions/hierarchy";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Sparkles,
  CalendarDays,
} from "lucide-react";

interface AcademicCalendarManagerProps {
  initialAcademicYears: any[];
}

export function AcademicCalendarManager({
  initialAcademicYears,
}: AcademicCalendarManagerProps) {
  const [academicYears, setAcademicYears] = useState(initialAcademicYears);
  const activeYear =
    academicYears.find((y) => y.isActive || y.isCurrent) || academicYears[0];
  const [selectedYearId, setSelectedYearId] = useState<string>(
    activeYear?.id || ""
  );

  const [semesters, setSemesters] = useState<any[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<any | null>(null);

  // Load semesters when selected year changes
  useEffect(() => {
    if (!selectedYearId) return;
    setLoadingSemesters(true);
    getSemesters(selectedYearId)
      .then((data) => setSemesters(data))
      .catch((err) => toast.error("Failed to load semesters: " + err.message))
      .finally(() => setLoadingSemesters(false));
  }, [selectedYearId]);

  // Create Academic Year
  async function handleCreateAcademicYear(formData: FormData) {
    try {
      const name = (formData.get("name") as string)?.trim();
      if (!name || name.length < 4) {
        toast.error("Academic Year label must be at least 4 characters (e.g. 2026-2027).");
        return;
      }

      const startVal = formData.get("startDate") as string;
      const endVal = formData.get("endDate") as string;
      if (!startVal || !endVal) {
        toast.error("Both start date and end date are required.");
        return;
      }

      const startDate = new Date(startVal);
      const endDate = new Date(endVal);
      if (startDate >= endDate) {
        toast.error("Academic Year end date must be after start date.");
        return;
      }

      const isActive = formData.get("isActive") === "on";

      await createAcademicYear({ name, startDate, endDate, isActive });
      setIsYearModalOpen(false);
      toast.success(`Academic Year "${name}" created successfully.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error creating academic year: " + e.message);
    }
  }

  // Set Current Active Year
  async function handleSetActiveYear(id: string) {
    try {
      await setAcademicYearActive(id);
      setSelectedYearId(id);
      toast.success("Active Academic Year updated.");
      window.location.reload();
    } catch (e: any) {
      toast.error("Error setting active year: " + e.message);
    }
  }

  // Bulk Activate Term (Odd or Even)
  async function handleBulkActivate(termType: "ODD" | "EVEN") {
    try {
      await toggleTermTypeSemesters(selectedYearId, termType, "ACTIVE");
      // Mark opposite term as LOCKED or UPCOMING
      const oppositeTerm = termType === "ODD" ? "EVEN" : "ODD";
      await toggleTermTypeSemesters(selectedYearId, oppositeTerm, "LOCKED");

      const refreshed = await getSemesters(selectedYearId);
      setSemesters(refreshed);
      toast.success(`Activated ${termType} Semesters (and locked ${oppositeTerm} Semesters).`);
    } catch (e: any) {
      toast.error("Error updating terms: " + e.message);
    }
  }

  // Save single semester configuration
  async function handleSaveSemester(formData: FormData) {
    if (!editingSemester) return;
    try {
      const status = formData.get("status") as any;
      const startDateVal = formData.get("startDate") as string;
      const endDateVal = formData.get("endDate") as string;
      const breakSchedule = (formData.get("breakSchedule") as string)?.trim();

      if (startDateVal && endDateVal) {
        const start = new Date(startDateVal);
        const end = new Date(endDateVal);
        if (start >= end) {
          toast.error("Semester end date must be after start date.");
          return;
        }
      }

      await updateSemester(editingSemester.id, {
        status,
        startDate: startDateVal ? new Date(startDateVal) : null,
        endDate: endDateVal ? new Date(endDateVal) : null,
        breakSchedule: breakSchedule || null,
      });

      setEditingSemester(null);
      const refreshed = await getSemesters(selectedYearId);
      setSemesters(refreshed);
      toast.success(`Semester ${editingSemester.semNumber} configuration saved.`);
    } catch (e: any) {
      toast.error("Error updating semester: " + e.message);
    }
  }

  const oddSemesters = semesters.filter((s) => s.termType === "ODD");
  const evenSemesters = semesters.filter((s) => s.termType === "EVEN");

  function getStatusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px]">
            <CheckCircle2 className="w-3 h-3" /> Active Term
          </Badge>
        );
      case "LOCKED":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <Lock className="w-3 h-3" /> Locked
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <Clock className="w-3 h-3" /> Upcoming
          </Badge>
        );
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-xl border">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Dynamic Academic Calendar & Terms
          </h3>
          <p className="text-sm text-muted-foreground">
            Define global Academic Years (e.g., 2026-2027) and flag active semester slots (Odd: Sem I, III, V vs. Even: Sem II, IV, VI).
          </p>
        </div>
        <Dialog open={isYearModalOpen} onOpenChange={setIsYearModalOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
            <Plus className="w-4 h-4" /> Add Academic Year
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Global Academic Year</DialogTitle>
            </DialogHeader>
            <form action={handleCreateAcademicYear} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Academic Year Label</label>
                <Input name="name" required placeholder="e.g. 2026-2027" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Session Start</label>
                  <Input name="startDate" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Session End</label>
                  <Input name="endDate" type="date" required />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Set as Currently Active Academic Year
                </label>
              </div>
              <Button type="submit" className="w-full">Create Academic Year</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Academic Year Selection Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {academicYears.map((ay) => {
          const isSelected = selectedYearId === ay.id;
          const isCurrent = ay.isActive || ay.isCurrent;
          return (
            <div key={ay.id} className="flex items-center gap-1">
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYearId(ay.id)}
                className="gap-2 text-xs font-semibold rounded-lg"
              >
                {ay.name || ay.yearLabel}
                {isCurrent && (
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-background/30 text-current">
                    Active
                  </Badge>
                )}
              </Button>
              {!isCurrent && isSelected && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-primary underline px-1.5"
                  onClick={() => handleSetActiveYear(ay.id)}
                >
                  Make Active
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Term Quick Controller */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3">
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Semester Term Control Window ({academicYears.find((y) => y.id === selectedYearId)?.name})
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Quick switch academic term windows for college-wide operations (attendance, lectures, allocations).
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkActivate("ODD")}
              className="text-xs border-primary/40 hover:bg-primary/5"
            >
              Activate Odd Semesters (I, III, V, VII)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkActivate("EVEN")}
              className="text-xs border-primary/40 hover:bg-primary/5"
            >
              Activate Even Semesters (II, IV, VI, VIII)
            </Button>
          </div>
        </div>

        {loadingSemesters ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Loading semester terms...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Odd Semesters Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-sm text-primary flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">ODD</Badge>
                  Term 1: Odd Semesters (Sem I, III, V, VII)
                </span>
              </div>
              <div className="space-y-2">
                {oddSemesters.map((sem) => (
                  <div
                    key={sem.id}
                    className="p-3 border rounded-lg bg-background flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          Semester {sem.semNumber}
                        </span>
                        {getStatusBadge(sem.status)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {sem.startDate
                          ? `${new Date(sem.startDate).toLocaleDateString()} - ${
                              sem.endDate
                                ? new Date(sem.endDate).toLocaleDateString()
                                : "TBD"
                            }`
                          : "Dates not configured"}
                        {sem.breakSchedule && ` • Break: ${sem.breakSchedule}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setEditingSemester(sem)}
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Even Semesters Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-sm text-primary flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">EVEN</Badge>
                  Term 2: Even Semesters (Sem II, IV, VI, VIII)
                </span>
              </div>
              <div className="space-y-2">
                {evenSemesters.map((sem) => (
                  <div
                    key={sem.id}
                    className="p-3 border rounded-lg bg-background flex items-center justify-between hover:border-primary/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          Semester {sem.semNumber}
                        </span>
                        {getStatusBadge(sem.status)}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {sem.startDate
                          ? `${new Date(sem.startDate).toLocaleDateString()} - ${
                              sem.endDate
                                ? new Date(sem.endDate).toLocaleDateString()
                                : "TBD"
                            }`
                          : "Dates not configured"}
                        {sem.breakSchedule && ` • Break: ${sem.breakSchedule}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setEditingSemester(sem)}
                    >
                      Configure
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Semester Modal */}
      {editingSemester && (
        <Dialog
          open={!!editingSemester}
          onOpenChange={(open) => !open && setEditingSemester(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Configure Semester {editingSemester.semNumber} ({editingSemester.termType} Term)
              </DialogTitle>
            </DialogHeader>
            <form action={handleSaveSemester} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Term Status</label>
                <select
                  name="status"
                  defaultValue={editingSemester.status}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ACTIVE">ACTIVE (Lectures & Attendance Ongoing)</option>
                  <option value="LOCKED">LOCKED (Term Finished / Marks Locked)</option>
                  <option value="UPCOMING">UPCOMING (Future Semester)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Term Start Date</label>
                  <Input
                    name="startDate"
                    type="date"
                    defaultValue={
                      editingSemester.startDate
                        ? new Date(editingSemester.startDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Term End Date</label>
                  <Input
                    name="endDate"
                    type="date"
                    defaultValue={
                      editingSemester.endDate
                        ? new Date(editingSemester.endDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Break Schedule Notes</label>
                <Input
                  name="breakSchedule"
                  placeholder="e.g. Diwali Vacation (Nov 1 - Nov 15), Study Leave"
                  defaultValue={editingSemester.breakSchedule || ""}
                />
              </div>
              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
