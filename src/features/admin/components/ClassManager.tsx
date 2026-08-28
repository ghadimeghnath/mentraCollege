"use client"

import { useState } from "react";
import { Department, AcademicLevel, Division, Class, AcademicYear } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createDivision, createClass } from "../actions/academic";
import { toast } from "sonner";

export function ClassManager({ 
  initialClasses, 
  initialDivisions,
  departments,
  levels,
  academicYears
}: { 
  initialClasses: (Class & { department: Department, level: AcademicLevel, division: Division, academicYear: AcademicYear })[], 
  initialDivisions: (Division & { level: AcademicLevel })[],
  departments: Department[],
  levels: AcademicLevel[],
  academicYears: AcademicYear[]
}) {
  const [isDivOpen, setIsDivOpen] = useState(false);
  const [isClassOpen, setIsClassOpen] = useState(false);
  
  async function handleCreateDivision(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const levelId = formData.get("levelId") as string;
      await createDivision({ name, levelId });
      setIsDivOpen(false);
      toast.success("Division created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  async function handleCreateClass(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const departmentId = formData.get("departmentId") as string;
      const levelId = formData.get("levelId") as string;
      const divisionId = formData.get("divisionId") as string;
      const academicYearId = formData.get("academicYearId") as string;
      
      await createClass({ name, departmentId, levelId, divisionId, academicYearId });
      setIsClassOpen(false);
      toast.success("Class created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Divisions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Divisions</h3>
          <Dialog open={isDivOpen} onOpenChange={setIsDivOpen}>
            <DialogTrigger render={<Button size="sm" variant="secondary" />}>
              Add Division
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Division</DialogTitle>
              </DialogHeader>
              <form action={handleCreateDivision} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Level</label>
                  <select name="levelId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Level</option>
                    {levels.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division Name</label>
                  <Input name="name" required placeholder="e.g. A, B" />
                </div>
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Division Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialDivisions.map((div) => (
                <TableRow key={div.id}>
                  <TableCell className="font-medium">{div.name}</TableCell>
                  <TableCell>{div.level.name}</TableCell>
                  <TableCell>{div.status ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
              {initialDivisions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">No divisions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Classes Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Classes</h3>
          <Dialog open={isClassOpen} onOpenChange={setIsClassOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              Add Class
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Class</DialogTitle>
              </DialogHeader>
              <form action={handleCreateClass} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class Name</label>
                  <Input name="name" required placeholder="e.g. FY BCA A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Academic Year</label>
                  <select name="academicYearId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="">Select Year</option>
                    {academicYears.map(y => (
                      <option key={y.id} value={y.id}>{y.name} {y.isActive ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Department</label>
                    <select name="departmentId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Select Dept</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Level</label>
                    <select name="levelId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="">Select Level</option>
                      {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Division</label>
                  <select name="divisionId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="">Select Division</option>
                    {initialDivisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <Button type="submit" className="w-full">Create</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Academic Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.department.name}</TableCell>
                  <TableCell>{cls.level.name}</TableCell>
                  <TableCell>{cls.division.name}</TableCell>
                  <TableCell>{cls.academicYear.name}</TableCell>
                </TableRow>
              ))}
              {initialClasses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">No classes found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
