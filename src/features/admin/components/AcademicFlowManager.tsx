"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AcademicCalendarManager } from "./AcademicCalendarManager";
import { ProgramManager } from "./ProgramManager";
import { SubjectManager } from "./SubjectManager";
import { SubjectAllocationWorkflow } from "./SubjectAllocationWorkflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CalendarDays,
  Building2,
  BookOpen,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface AcademicFlowManagerProps {
  academicYears: any[];
  departments: any[];
  programs: any[];
  subjects: any[];
  faculties: any[];
}

export function AcademicFlowManager({
  academicYears,
  departments,
  programs,
  subjects,
  faculties,
}: AcademicFlowManagerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStep = searchParams.get("step") || "calendar";

  const [currentStep, setCurrentStep] = useState<string>(initialStep);

  const steps = [
    {
      id: "calendar",
      stepNumber: 1,
      title: "Academic Calendar & Terms",
      subtitle: "Academic Year & Odd/Even Term slots",
      icon: CalendarDays,
      badge: `${academicYears.length} Years`,
    },
    {
      id: "programs",
      stepNumber: 2,
      title: "Departments & Programs",
      subtitle: "Degree hierarchy, Year Levels & Divisions",
      icon: Building2,
      badge: `${departments.length} Depts, ${programs.length} Programs`,
    },
    {
      id: "courses",
      stepNumber: 3,
      title: "Course Master",
      subtitle: "Theory, Practical & Both components",
      icon: BookOpen,
      badge: `${subjects.length} Subjects`,
    },
    {
      id: "allocations",
      stepNumber: 4,
      title: "Faculty Allocation",
      subtitle: "Subject-to-Division Dual Faculty Assignment",
      icon: UserCheck,
      badge: "Core Workflow",
    },
  ];

  function handleSelectStep(stepId: string) {
    setCurrentStep(stepId);
    router.replace(`/admin?step=${stepId}`, { scroll: false });
  }

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="space-y-6">
      {/* Visual Workflow Pipeline Banner */}
      <div className="bg-card border rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Administrative Lifecycle Flow
              </span>
            </div>
            <h3 className="text-lg font-bold tracking-tight mt-0.5">
              Academic Setup & Curriculum Pipeline
            </h3>
          </div>
          <div className="text-xs text-muted-foreground">
            Follow Step 1 &rarr; Step 4 to complete academic configuring.
          </div>
        </div>

        {/* 4-Step Stepper Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = idx < currentIndex;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleSelectStep(step.id)}
                className={`relative text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isActive
                    ? "bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs"
                    : "bg-background hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      step.stepNumber
                    )}
                  </div>
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="text-[10px] font-normal px-2 py-0"
                  >
                    {step.badge}
                  </Badge>
                </div>

                <div>
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    {step.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                    {step.subtitle}
                  </div>
                </div>

                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Area */}
      <div className="transition-all duration-200">
        {currentStep === "calendar" && (
          <div className="space-y-6">
            <AcademicCalendarManager initialAcademicYears={academicYears} />
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={() => handleSelectStep("programs")}
                className="gap-2 text-xs"
              >
                Next: Setup Departments & Programs <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "programs" && (
          <div className="space-y-6">
            <ProgramManager initialDepartments={departments} />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectStep("calendar")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Academic Calendar
              </Button>
              <Button
                onClick={() => handleSelectStep("courses")}
                className="gap-2 text-xs"
              >
                Next: Configure Course Master <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "courses" && (
          <div className="space-y-6">
            <SubjectManager initialSubjects={subjects} programs={programs} />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectStep("programs")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Departments & Programs
              </Button>
              <Button
                onClick={() => handleSelectStep("allocations")}
                className="gap-2 text-xs"
              >
                Next: Subject Allocation Workflow <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "allocations" && (
          <div className="space-y-6">
            <SubjectAllocationWorkflow
              academicYears={academicYears}
              programs={programs}
              faculties={faculties}
            />
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleSelectStep("courses")}
                className="gap-2 text-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Course Master
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSelectStep("calendar")}
                className="gap-2 text-xs"
              >
                Return to Academic Calendar <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
