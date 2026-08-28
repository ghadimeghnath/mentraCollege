"use client"

import { useState } from "react";
import { Subject, Class, Department, AcademicLevel, Division } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createSubject, assignSubjectToClass } from "../actions/subject";
import { toast } from "sonner";

export function SubjectManager({ 
  initialSubjects,
  classes
}: { 
  initialSubjects: Subject[],
  classes: (Class & { department: Department, level: AcademicLevel, division: Division })[]
}) {
  const [isSubjOpen, setIsSubjOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  async function handleCreateSubject(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const description = formData.get("description") as string;
      await createSubject({ name, code, description });
      setIsSubjOpen(false);
      toast.success("Subject created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  async function handleAssignSubject(formData: FormData) {
    try {
      const classId = formData.get("classId") as string;
      const subjectId = formData.get("subjectId") as string;
      await assignSubjectToClass(classId, subjectId);
      setIsAssignOpen(false);
      toast.success("Subject assigned to class.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Subjects Repository</h3>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogTrigger render={<Button size="sm" variant="secondary" />}>
                Assign Subject to Class
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Subject</DialogTitle>
                </DialogHeader>
                <form action={handleAssignSubject} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class</label>
                    <select name="classId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Select Class</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.department.name} - {c.level.name})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <select name="subjectId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Select Subject</option>
                      {initialSubjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code || 'N/A'})</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">Assign</Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isSubjOpen} onOpenChange={setIsSubjOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                Create Subject
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subject</DialogTitle>
                </DialogHeader>
                <form action={handleCreateSubject} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Name</label>
                    <Input name="name" required placeholder="e.g. Web Development" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject Code</label>
                    <Input name="code" placeholder="e.g. CS101" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input name="description" placeholder="Optional description..." />
                  </div>
                  <Button type="submit" className="w-full">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
              {initialSubjects.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>{sub.code || "-"}</TableCell>
                  <TableCell>{sub.isActive ? "Active" : "Inactive"}</TableCell>
                </TableRow>
              ))}
              {initialSubjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">No subjects found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
