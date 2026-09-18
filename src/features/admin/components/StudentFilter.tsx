"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Class, Department, AcademicLevel, Division, AcademicYear } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function StudentFilter({
  classes,
  academicYears,
  programs,
}: {
  classes: (Class & { department: Department; level: AcademicLevel; division: Division })[];
  academicYears: AcademicYear[];
  programs?: any[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentClassId = searchParams.get("classId") || "";
  const currentYearId = searchParams.get("yearId") || "";

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const classId = formData.get("classId") as string;
    const yearId = formData.get("yearId") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (classId) params.set("classId", classId);
    else params.delete("classId");
    
    if (yearId) params.set("yearId", yearId);
    else params.delete("yearId");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    router.push(pathname);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Students</CardTitle>
        <CardDescription>Select a class and academic year to view enrolled students.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleApply} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full sm:w-1/3">
            <label htmlFor="yearId" className="text-sm font-medium">Academic Year</label>
            <select
              id="yearId"
              name="yearId"
              defaultValue={currentYearId}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Years</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 w-full sm:w-1/3">
            <label htmlFor="classId" className="text-sm font-medium">Class</label>
            <select
              id="classId"
              name="classId"
              defaultValue={currentClassId}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => {
                const program = (c as any).division?.program;
                const yearLevel = (c as any).division?.yearLevel;
                const divName = (c as any).division?.name;566
                const displayName = program ? `${program.title} - ${yearLevel} - Div ${divName}` : `${c.name} (${c.department.code})`;
                
                return (
                  <option key={c.id} value={c.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button type="submit">View Students</Button>
            {(currentClassId || currentYearId) && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
