"use client"

import { useState } from "react";
import { Department, AcademicLevel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createDepartment, createAcademicLevel } from "../actions/academic";
import { toast } from "sonner";

export function DepartmentManager({ 
  initialDepartments, 
  initialLevels 
}: { 
  initialDepartments: Department[], 
  initialLevels: (AcademicLevel & { department: Department })[] 
}) {
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  
  async function handleCreateDept(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      await createDepartment({ name, code });
      setIsDeptOpen(false);
      toast.success("Department created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  async function handleCreateLevel(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const departmentId = formData.get("departmentId") as string;
      await createAcademicLevel({ name, departmentId });
      setIsLevelOpen(false);
      toast.success("Academic Level created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Departments Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Departments</h3>
          <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
            <DialogTrigger render={<Button size="sm" />}>
              Add Department
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Department</DialogTitle>
              </DialogHeader>
              <form action={handleCreateDept} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input name="name" required placeholder="e.g. BCA, BCom" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code (Optional)</label>
                  <Input name="code" placeholder="e.g. CS" />
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
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.code || "-"}</TableCell>
                  <TableCell>
                    {dept.status ? "Active" : "Inactive"}
                  </TableCell>
                </TableRow>
              ))}
              {initialDepartments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">No departments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Levels Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Academic Levels</h3>
          <Dialog open={isLevelOpen} onOpenChange={setIsLevelOpen}>
            <DialogTrigger render={<Button size="sm" variant="secondary" />}>
              Add Level
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Academic Level</DialogTitle>
              </DialogHeader>
              <form action={handleCreateLevel} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <select name="departmentId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Department</option>
                    {initialDepartments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level Name</label>
                  <Input name="name" required placeholder="e.g. First Year, FY" />
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
                <TableHead>Level Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialLevels.map((lvl) => (
                <TableRow key={lvl.id}>
                  <TableCell className="font-medium">{lvl.name}</TableCell>
                  <TableCell>{lvl.department.name}</TableCell>
                  <TableCell>{lvl.status ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
              {initialLevels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">No levels found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
