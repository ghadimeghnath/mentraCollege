"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AcademicCalendarManager } from "./AcademicCalendarManager";
import { ProgramManager } from "./ProgramManager";
import { SubjectManager } from "./SubjectManager";
import { SubjectAllocationWorkflow } from "./SubjectAllocationWorkflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Building2,
  BookOpen,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  GraduationCap,
} from "lucide-react";

interface AcademicCommandCenterProps {
  academicYears: any[];
  departments: any[];
  programs: any[];
  subjects: any[];
  faculties: any[];
}

export function AcademicCommandCenter({
  academicYears,
  departments,
  programs,
  subjects,
  faculties,
}: AcademicCommandCenterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || searchParams.get("step") || "calendar";
  const [activeTab, setActiveTab] = useState<string>(tabParam);

  function handleSelectTab(tabId: string) {
    setActiveTab(tabId);
    router.replace(`/admin?tab=${tabId}`, { scroll: false });
  }

  const activeYear =
    academicYears.find((y) => y.isActive || y.isCurrent) || academicYears[0];

  const totalYearLevels = programs.reduce(
    (acc, p) => acc + (p.yearLevels?.length || 0),
    0
  );
  const totalDivisions = programs.reduce(
    (acc, p) =>
      acc +
      (p.yearLevels?.reduce(
        (yAcc: number, yl: any) => yAcc + (yl.divisions?.length || 0),
        0
      ) || 0),
    0
  );

  const theoryCount = subjects.filter((s) => s.hasTheory).length;
  const practicalCount = subjects.filter((s) => s.hasPractical).length;

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Academic Structure & Curriculum Setup
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure calendar sessions, degree programs, course components, and faculty division allocations.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards / Quick Switchers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card
          onClick={() => handleSelectTab("calendar")}
          className={`cursor-pointer transition-all hover:border-primary/60 border ${
            activeTab === "calendar" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Session
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {activeYear?.name || "Not Configured"}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                {academicYears.length} session(s) recorded
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleSelectTab("programs")}
          className={`cursor-pointer transition-all hover:border-primary/60 border ${
            activeTab === "programs" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Programs & Depts
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {programs.length} in {departments.length} Depts
              </p>
              <p className="text-[11px] text-muted-foreground">
                {totalYearLevels} Year Levels • {totalDivisions} Divs
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleSelectTab("courses")}
          className={`cursor-pointer transition-all hover:border-primary/60 border ${
            activeTab === "courses" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Course Master
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {subjects.length} Subjects
              </p>
              <p className="text-[11px] text-muted-foreground">
                {theoryCount} Theory • {practicalCount} Lab
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleSelectTab("allocations")}
          className={`cursor-pointer transition-all hover:border-primary/60 border ${
            activeTab === "allocations" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "bg-card"
          }`}
        >
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Faculty Allocation
              </p>
              <p className="text-base font-bold text-foreground mt-0.5">
                {faculties.length} Teachers
              </p>
              <p className="text-[11px] text-primary font-medium">
                Dual Faculty Mapping &rarr;
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Active Tab Content Area */}
      <div className="space-y-6 pt-1">
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <AcademicCalendarManager initialAcademicYears={academicYears} />
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => handleSelectTab("programs")}
                className="gap-2 text-xs"
              >
                Next: Setup Departments & Programs <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === "programs" && (
          <div className="space-y-6">
            <ProgramManager initialDepartments={departments} />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectTab("calendar")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Calendar
              </Button>
              <Button
                onClick={() => handleSelectTab("courses")}
                className="gap-2 text-xs"
              >
                Next: Configure Course Master <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="space-y-6">
            <SubjectManager initialSubjects={subjects} programs={programs} />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectTab("programs")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Programs
              </Button>
              <Button
                onClick={() => handleSelectTab("allocations")}
                className="gap-2 text-xs"
              >
                Next: Faculty Subject Allocation <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {activeTab === "allocations" && (
          <div className="space-y-6">
            <SubjectAllocationWorkflow
              academicYears={academicYears}
              programs={programs}
              faculties={faculties}
            />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectTab("courses")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Course Master
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSelectTab("calendar")}
                className="gap-2 text-xs"
              >
                Return to Academic Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
