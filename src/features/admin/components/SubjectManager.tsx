"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { createSubject, deleteSubject } from "../actions/subject";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Layers,
} from "lucide-react";

export function SubjectManager({
  initialSubjects,
  programs = [],
}: {
  initialSubjects: any[];
  programs?: any[];
}) {
  const [isSubjOpen, setIsSubjOpen] = useState(false);
  const [selectedProgFilter, setSelectedProgFilter] = useState<string>("ALL");
  const [selectedSemFilter, setSelectedSemFilter] = useState<string>("ALL");

  // Component Checkbox States for Modal
  const [modalTheory, setModalTheory] = useState(true);
  const [modalPractical, setModalPractical] = useState(false);

  async function handleCreateSubject(formData: FormData) {
    try {
      const name = (formData.get("name") as string)?.trim();
      const code = (formData.get("code") as string)?.trim().toUpperCase();
      const description = (formData.get("description") as string)?.trim();
      const programId = formData.get("programId") as string;
      const semNumberStr = formData.get("semNumber") as string;
      const semNumber = semNumberStr ? parseInt(semNumberStr, 10) : undefined;

      if (!name || name.length < 2) {
        toast.error("Subject title must be at least 2 characters long.");
        return;
      }

      if (!programId) {
        toast.error("Please select a target Degree Program.");
        return;
      }

      if (!semNumber || isNaN(semNumber) || semNumber < 1 || semNumber > 8) {
        toast.error("Please select a valid Semester slot (1 to 8).");
        return;
      }

      if (!modalTheory && !modalPractical) {
        toast.error("Please select at least one operational component (Theory, Practical, or Both).");
        return;
      }

      // Check duplicate subject in same program & semester
      const duplicate = initialSubjects.find(
        (s) =>
          s.programId === programId &&
          s.semNumber === semNumber &&
          s.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicate) {
        toast.error(`Subject "${name}" is already registered for this semester.`);
        return;
      }

      await createSubject({
        name,
        code: code || undefined,
        description: description || undefined,
        programId: programId || undefined,
        semNumber,
        hasTheory: modalTheory,
        hasPractical: modalPractical,
      });

      setIsSubjOpen(false);
      const compLabel = modalTheory && modalPractical ? "Both (Theory & Practical)" : modalTheory ? "Theory Only" : "Practical Only";
      toast.success(`Subject "${name}" created with ${compLabel}.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error creating subject: " + e.message);
    }
  }

  async function handleDeleteSubject(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteSubject(id);
      toast.success(`Subject "${name}" deleted.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error deleting subject: " + e.message);
    }
  }

  const filteredSubjects = initialSubjects.filter((s) => {
    if (selectedProgFilter !== "ALL" && s.programId !== selectedProgFilter) {
      return false;
    }
    if (
      selectedSemFilter !== "ALL" &&
      s.semNumber !== parseInt(selectedSemFilter, 10)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-xl border">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Course Master & Curriculum
          </h3>
          <p className="text-sm text-muted-foreground">
            Define subjects under specific degree programs and configure operational components (Theory, Practical, or Both).
          </p>
        </div>

        <Dialog open={isSubjOpen} onOpenChange={setIsSubjOpen}>
          <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
            <Plus className="w-4 h-4" /> Create Subject
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Subject in Course Master</DialogTitle>
            </DialogHeader>
            <form action={handleCreateSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject Title / Name</label>
                <Input
                  name="name"
                  required
                  placeholder="e.g. Web Application Development"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Subject Code</label>
                  <Input name="code" placeholder="e.g. CS301" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Degree Program</label>
                  <select
                    name="programId"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.department?.name || p.degreeLevel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Semester Slot</label>
                <select
                  name="semNumber"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem} ({sem % 2 === 1 ? "Odd Term" : "Even Term"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Operational Component Selection */}
              <div className="space-y-2 border rounded-lg p-3 bg-muted/20">
                <label className="text-sm font-semibold">
                  Course Operational Components
                </label>
                <div className="flex gap-4 items-center pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalTheory}
                      onChange={(e) => setModalTheory(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Theory Lecture</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalPractical}
                      onChange={(e) => setModalPractical(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    <span>Practical / Lab</span>
                  </label>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-auto text-xs h-7 px-2"
                    onClick={() => {
                      setModalTheory(true);
                      setModalPractical(true);
                    }}
                  >
                    Select Both
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dual-faculty allocation will render separate teacher dropdowns if Both is selected.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  name="description"
                  placeholder="e.g. Full-stack development with Next.js & TypeScript"
                />
              </div>

              <Button type="submit" className="w-full">Create Subject</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter Program:</span>
          <select
            value={selectedProgFilter}
            onChange={(e) => setSelectedProgFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
          >
            <option value="ALL">All Programs</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter Semester:</span>
          <select
            value={selectedSemFilter}
            onChange={(e) => setSelectedSemFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
          >
            <option value="ALL">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem.toString()}>
                Sem {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="border rounded-xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Subject Title & Code</TableHead>
              <TableHead>Degree Program</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Components</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-semibold text-sm">{sub.name}</div>
                  {sub.code && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {sub.code}
                    </span>
                  )}
                  {sub.description && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                      {sub.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {sub.program ? (
                    <Badge variant="secondary" className="text-xs font-medium">
                      {sub.program.title}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Global</span>
                  )}
                </TableCell>
                <TableCell>
                  {sub.semNumber ? (
                    <Badge variant="outline" className="text-xs">
                      Sem {sub.semNumber}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5 flex-wrap">
                    {sub.hasTheory && (
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0.2">
                        Theory
                      </Badge>
                    )}
                    {sub.hasPractical && (
                      <Badge className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] px-1.5 py-0.2">
                        Practical
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteSubject(sub.id, sub.name)}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredSubjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                  No subjects found. Click &quot;Create Subject&quot; above to add courses.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
