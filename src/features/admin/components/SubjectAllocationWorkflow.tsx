"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  saveSubjectAllocation,
  getSubjectAllocationsByDivision,
} from "../actions/subject";
import {
  BookOpen,
  UserCheck,
  CheckCircle,
  FlaskConical,
  GraduationCap,
  Save,
  Filter,
  Calendar,
  Layers,
} from "lucide-react";

interface SubjectAllocationWorkflowProps {
  academicYears: any[];
  programs: any[];
  faculties: any[];
}

export function SubjectAllocationWorkflow({
  academicYears,
  programs,
  faculties,
}: SubjectAllocationWorkflowProps) {
  // Cascading Selection State
  const activeYear =
    academicYears.find((y) => y.isActive || y.isCurrent) || academicYears[0];
  const [selectedYearId, setSelectedYearId] = useState<string>(
    activeYear?.id || ""
  );
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    programs[0]?.id || ""
  );
  const [selectedSemNumber, setSelectedSemNumber] = useState<number>(1);
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  // Filtered program & division options
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const maxSemesters = selectedProgram ? selectedProgram.durationYears * 2 : 6;

  // Calculate matching yearLevel for selected semester
  // Sem 1, 2 -> Year 1 (FY); Sem 3, 4 -> Year 2 (SY); Sem 5, 6 -> Year 3 (TY)
  const currentYearNumber = Math.ceil(selectedSemNumber / 2);
  const matchingYearLevel = selectedProgram?.yearLevels?.find(
    (yl: any) => yl.yearNumber === currentYearNumber
  );
  const availableDivisions = matchingYearLevel?.divisions || [];

  // Keep division updated if available divisions change
  useEffect(() => {
    if (availableDivisions.length > 0) {
      if (!availableDivisions.some((d: any) => d.id === selectedDivisionId)) {
        setSelectedDivisionId(availableDivisions[0].id);
      }
    } else {
      setSelectedDivisionId("");
    }
  }, [selectedProgramId, selectedSemNumber, availableDivisions]);

  // Subjects registered for Program + SemNumber
  const subjects =
    selectedProgram?.subjects?.filter(
      (s: any) => s.semNumber === selectedSemNumber
    ) || [];

  // Local allocations state: { [subjectId]: { theoryFacultyId: string, practicalFacultyId: string } }
  const [allocations, setAllocations] = useState<{
    [subjectId: string]: {
      theoryFacultyId: string;
      practicalFacultyId: string;
    };
  }>({});

  const [savingMap, setSavingMap] = useState<{ [subjectId: string]: boolean }>({});
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  // Fetch existing allocations when division changes
  useEffect(() => {
    if (!selectedDivisionId) {
      setAllocations({});
      return;
    }

    setLoadingAllocations(true);
    getSubjectAllocationsByDivision(selectedDivisionId, selectedYearId)
      .then((records) => {
        const map: {
          [subjectId: string]: {
            theoryFacultyId: string;
            practicalFacultyId: string;
          };
        } = {};

        records.forEach((rec: any) => {
          if (!map[rec.subjectId]) {
            map[rec.subjectId] = { theoryFacultyId: "", practicalFacultyId: "" };
          }
          if (rec.componentType === "THEORY") {
            map[rec.subjectId].theoryFacultyId = rec.facultyId;
          } else if (rec.componentType === "PRACTICAL") {
            map[rec.subjectId].practicalFacultyId = rec.facultyId;
          }
        });

        setAllocations(map);
      })
      .catch((err) => toast.error("Error loading allocations: " + err.message))
      .finally(() => setLoadingAllocations(false));
  }, [selectedDivisionId, selectedYearId]);

  function handleFacultyChange(
    subjectId: string,
    component: "THEORY" | "PRACTICAL",
    facultyId: string
  ) {
    setAllocations((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || { theoryFacultyId: "", practicalFacultyId: "" }),
        [component === "THEORY" ? "theoryFacultyId" : "practicalFacultyId"]: facultyId,
      },
    }));
  }

  async function handleSaveAllocation(subjectId: string) {
    if (!selectedDivisionId) {
      toast.error("Please select a target Division before saving allocations.");
      return;
    }

    setSavingMap((prev) => ({ ...prev, [subjectId]: true }));
    try {
      const subject = subjects.find((s: any) => s.id === subjectId);
      const subjectAlloc = allocations[subjectId] || {
        theoryFacultyId: "",
        practicalFacultyId: "",
      };

      await saveSubjectAllocation({
        divisionId: selectedDivisionId,
        subjectId,
        academicYearId: selectedYearId,
        theoryFacultyId: subjectAlloc.theoryFacultyId,
        practicalFacultyId: subjectAlloc.practicalFacultyId,
      });

      const theoryTeacher = faculties.find(
        (f) => (f.facultyProfile?.id || f.id) === subjectAlloc.theoryFacultyId
      );
      const practicalTeacher = faculties.find(
        (f) => (f.facultyProfile?.id || f.id) === subjectAlloc.practicalFacultyId
      );

      const tName = theoryTeacher?.profile?.name || theoryTeacher?.email;
      const pName = practicalTeacher?.profile?.name || practicalTeacher?.email;

      if (tName && pName) {
        toast.success(`Allocated ${subject?.name}: Theory &rarr; ${tName}, Practical &rarr; ${pName}`);
      } else if (tName) {
        toast.success(`Allocated ${subject?.name}: Theory &rarr; ${tName}`);
      } else if (pName) {
        toast.success(`Allocated ${subject?.name}: Practical &rarr; ${pName}`);
      } else {
        toast.info(`Updated allocations for ${subject?.name || "course"}.`);
      }
    } catch (e: any) {
      toast.error("Error saving allocation: " + e.message);
    } finally {
      setSavingMap((prev) => ({ ...prev, [subjectId]: false }));
    }
  }

  const [isSavingAll, setIsSavingAll] = useState(false);

  async function handleSaveAllAllocations() {
    if (!selectedDivisionId) {
      toast.error("Please select a target Division first.");
      return;
    }

    if (subjects.length === 0) {
      toast.info("No registered subjects to allocate.");
      return;
    }

    setIsSavingAll(true);
    try {
      for (const subj of subjects) {
        const subjectAlloc = allocations[subj.id] || {
          theoryFacultyId: "",
          practicalFacultyId: "",
        };
        await saveSubjectAllocation({
          divisionId: selectedDivisionId,
          subjectId: subj.id,
          academicYearId: selectedYearId,
          theoryFacultyId: subjectAlloc.theoryFacultyId,
          practicalFacultyId: subjectAlloc.practicalFacultyId,
        });
      }

      const divName = availableDivisions.find((d: any) => d.id === selectedDivisionId)?.name || "";
      toast.success(
        `Successfully saved faculty allocations for all ${subjects.length} subject(s) in Division ${divName}!`
      );
    } catch (e: any) {
      toast.error("Error saving bulk allocations: " + e.message);
    } finally {
      setIsSavingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cascading Filter Bar */}
      <Card className="border shadow-xs bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            Subject-to-Division Allocation Workflow
          </CardTitle>
          <CardDescription className="text-xs">
            Select Academic Year &rarr; Program &rarr; Semester &rarr; Division to allocate Theory & Practical faculty instructors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> 1. Academic Year
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => setSelectedYearId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name || y.yearLabel} {y.isActive ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Program */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> 2. Degree Program
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setSelectedSemNumber(1);
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.department?.name || p.degreeLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Semester */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> 3. Semester
              </label>
              <select
                value={selectedSemNumber}
                onChange={(e) => setSelectedSemNumber(Number(e.target.value))}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem} ({sem % 2 === 1 ? "Odd" : "Even"})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Division */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> 4. Division (Cohort)
              </label>
              <select
                value={selectedDivisionId}
                onChange={(e) => setSelectedDivisionId(e.target.value)}
                disabled={availableDivisions.length === 0}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {availableDivisions.length === 0 ? (
                  <option value="">No Divisions Configured</option>
                ) : (
                  availableDivisions.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      Division {d.name} ({matchingYearLevel?.title || "Year " + currentYearNumber})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Allocations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-base">
              Subjects Registered for {selectedProgram?.title} — Sem {selectedSemNumber}
            </h4>
            <p className="text-xs text-muted-foreground">
              {subjects.length} course(s) registered in Course Master. Dual faculty logic applied based on Theory & Practical components.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedDivisionId && (
              <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                Target: Div {availableDivisions.find((d: any) => d.id === selectedDivisionId)?.name}
              </Badge>
            )}
            {subjects.length > 0 && selectedDivisionId && (
              <Button
                size="sm"
                variant="default"
                disabled={isSavingAll}
                onClick={handleSaveAllAllocations}
                className="gap-1.5 text-xs shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingAll ? "Saving All..." : "Save All Allocations"}
              </Button>
            )}
          </div>
        </div>

        {loadingAllocations ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading allocations...
          </div>
        ) : subjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground space-y-2">
              <BookOpen className="w-10 h-10 mx-auto opacity-40" />
              <p className="font-medium">No subjects registered for {selectedProgram?.title} - Semester {selectedSemNumber} yet.</p>
              <p className="text-xs">Go to the &quot;Course Master&quot; tab to add subjects and configure their Theory / Practical components.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {subjects.map((subj: any) => {
              const subjAlloc = allocations[subj.id] || {
                theoryFacultyId: "",
                practicalFacultyId: "",
              };
              const isSaving = savingMap[subj.id];

              const hasBoth = subj.hasTheory && subj.hasPractical;
              const hasTheoryOnly = subj.hasTheory && !subj.hasPractical;
              const hasPracticalOnly = !subj.hasTheory && subj.hasPractical;

              return (
                <Card
                  key={subj.id}
                  className="border shadow-xs hover:border-primary/40 transition-colors"
                >
                  <CardHeader className="pb-3 bg-muted/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base font-semibold">
                            {subj.name}
                          </CardTitle>
                          {subj.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {subj.code}
                            </Badge>
                          )}
                        </div>
                        {subj.description && (
                          <CardDescription className="text-xs mt-0.5">
                            {subj.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {subj.hasTheory && (
                          <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] gap-1">
                            <BookOpen className="w-3 h-3" /> Theory
                          </Badge>
                        )}
                        {subj.hasPractical && (
                          <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] gap-1">
                            <FlaskConical className="w-3 h-3" /> Practical / Lab
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    {/* Faculty Assignment Rule Rendering */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Theory Instructor Dropdown */}
                      {subj.hasTheory && (
                        <div className="space-y-2 p-3 rounded-lg border bg-background">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> Theory Component Instructor
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                              (ISA & Lecture Attendance)
                            </span>
                          </div>
                          <select
                            value={subjAlloc.theoryFacultyId || ""}
                            onChange={(e) =>
                              handleFacultyChange(
                                subj.id,
                                "THEORY",
                                e.target.value
                              )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">-- Select Theory Faculty --</option>
                            {faculties.map((f: any) => {
                              const facProfile = f.facultyProfile;
                              const name = f.profile?.name || f.email;
                              return (
                                <option
                                  key={facProfile?.id || f.id}
                                  value={facProfile?.id || ""}
                                >
                                  {name}{" "}
                                  {facProfile?.initials
                                    ? `(${facProfile.initials})`
                                    : ""}{" "}
                                  {facProfile?.employeeId
                                    ? `[${facProfile.employeeId}]`
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                          {subjAlloc.theoryFacultyId && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                              <CheckCircle className="w-3 h-3" /> Assigned for Theory Attendance & ISA
                            </p>
                          )}
                        </div>
                      )}

                      {/* Practical / Lab Instructor Dropdown */}
                      {subj.hasPractical && (
                        <div className="space-y-2 p-3 rounded-lg border bg-background">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                              <FlaskConical className="w-3.5 h-3.5" /> Practical / Lab Instructor
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                              (Lab Batches & Gradebook)
                            </span>
                          </div>
                          <select
                            value={subjAlloc.practicalFacultyId || ""}
                            onChange={(e) =>
                              handleFacultyChange(
                                subj.id,
                                "PRACTICAL",
                                e.target.value
                              )
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">-- Select Practical Faculty --</option>
                            {faculties.map((f: any) => {
                              const facProfile = f.facultyProfile;
                              const name = f.profile?.name || f.email;
                              return (
                                <option
                                  key={facProfile?.id || f.id}
                                  value={facProfile?.id || ""}
                                >
                                  {name}{" "}
                                  {facProfile?.initials
                                    ? `(${facProfile.initials})`
                                    : ""}{" "}
                                  {facProfile?.employeeId
                                    ? `[${facProfile.employeeId}]`
                                    : ""}
                                </option>
                              );
                            })}
                          </select>
                          {subjAlloc.practicalFacultyId && (
                            <p className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
                              <CheckCircle className="w-3 h-3" /> Assigned for Lab Batches & Gradebook
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-end pt-1">
                      <Button
                        size="sm"
                        disabled={isSaving}
                        onClick={() => handleSaveAllocation(subj.id)}
                        className="gap-1.5 text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? "Saving..." : "Save Subject Allocation"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
