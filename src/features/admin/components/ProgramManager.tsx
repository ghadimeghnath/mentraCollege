"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  deleteDepartment,
  updateYearLevel,
  createProgramDivision,
  deleteDivision,
} from "../actions/hierarchy";
import { createDepartment } from "../actions/academic";
import {
  Plus,
  Trash2,
  Edit2,
  FolderTree,
  Layers,
  GraduationCap,
  Building2,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

interface ProgramManagerProps {
  initialDepartments: any[];
}

export function ProgramManager({ initialDepartments }: ProgramManagerProps) {
  const [departments, setDepartments] = useState(initialDepartments);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    initialDepartments[0]?.id || ""
  );

  // Dialog states
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isProgModalOpen, setIsProgModalOpen] = useState(false);
  const [isDivModalOpen, setIsDivModalOpen] = useState(false);
  const [selectedProgramForDiv, setSelectedProgramForDiv] = useState<any>(null);

  // Department deletion confirmation dialog state
  const [deptToDelete, setDeptToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingDept, setIsDeletingDept] = useState(false);

  // Edit Year Level state
  const [editingYearLevel, setEditingYearLevel] = useState<{ id: string; title: string } | null>(null);

  const currentDepartment = departments.find((d) => d.id === selectedDeptId);

  // Create Department
  async function handleCreateDepartment(formData: FormData) {
    try {
      const name = (formData.get("name") as string)?.trim();
      const code = (formData.get("code") as string)?.trim();

      if (!name || name.length < 2) {
        toast.error("Department name must be at least 2 characters long.");
        return;
      }

      await createDepartment({ name, code: code || undefined });
      setIsDeptModalOpen(false);
      toast.success(`Department "${name}" created successfully.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error creating department: " + e.message);
    }
  }

  // Create Program
  async function handleCreateProgram(formData: FormData) {
    try {
      const title = (formData.get("title") as string)?.trim();
      const code = (formData.get("code") as string)?.trim();
      const degreeLevel = formData.get("degreeLevel") as string;
      const durationYears = parseInt(formData.get("durationYears") as string, 10);

      if (!title || title.length < 2) {
        toast.error("Program title must be at least 2 characters (e.g. BCA, M.Com).");
        return;
      }

      if (isNaN(durationYears) || durationYears < 1 || durationYears > 5) {
        toast.error("Program duration must be between 1 and 5 years.");
        return;
      }

      // Check duplicate program in same department
      if (currentDepartment?.programs?.some((p: any) => p.title.toLowerCase() === title.toLowerCase())) {
        toast.error(`Program "${title}" already exists in ${currentDepartment.name}.`);
        return;
      }

      await createProgram({
        deptId: selectedDeptId,
        title,
        code: code || undefined,
        degreeLevel,
        durationYears,
      });

      setIsProgModalOpen(false);
      toast.success(`Program "${title}" created with auto-generated Year Levels and Divisions.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error creating program: " + e.message);
    }
  }

  // Edit Year Level Title
  async function handleSaveYearLevelTitle(id: string) {
    const trimmedTitle = editingYearLevel?.title?.trim();
    if (!trimmedTitle) {
      toast.error("Year level title cannot be empty.");
      return;
    }
    try {
      await updateYearLevel(id, trimmedTitle);
      setEditingYearLevel(null);
      toast.success(`Year level title updated to "${trimmedTitle}".`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error updating year level: " + e.message);
    }
  }

  // Add Division
  async function handleCreateDivision(formData: FormData) {
    try {
      const name = (formData.get("name") as string)?.trim().toUpperCase();
      const yearLevelId = formData.get("yearLevelId") as string;

      if (!name) {
        toast.error("Division name is required (e.g. A, B, C).");
        return;
      }

      if (name.length > 5) {
        toast.error("Division name should be 1 to 5 characters.");
        return;
      }

      // Check if division already exists in this year level
      const targetYl = selectedProgramForDiv?.yearLevels?.find((yl: any) => yl.id === yearLevelId);
      if (targetYl?.divisions?.some((d: any) => d.name.toUpperCase() === name)) {
        toast.error(`Division "${name}" already exists for ${targetYl.title}.`);
        return;
      }

      await createProgramDivision({
        programId: selectedProgramForDiv.id,
        yearLevelId,
        name,
      });

      setIsDivModalOpen(false);
      toast.success(`Division "${name}" added to ${targetYl?.title || "Year Level"}.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error adding division: " + e.message);
    }
  }

  // Delete Program
  async function handleDeleteProgram(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete program "${title}"?`)) return;
    try {
      await deleteProgram(id);
      toast.success(`Program "${title}" deleted.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error deleting program: " + e.message);
    }
  }

  // Delete Division
  async function handleDeleteDivision(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete Division "${name}"?`)) return;
    try {
      await deleteDivision(id);
      toast.success(`Division "${name}" deleted.`);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error deleting division: " + e.message);
    }
  }

  // Delete Department Confirmation Handler
  async function handleConfirmDeleteDepartment() {
    if (!deptToDelete) return;
    setIsDeletingDept(true);
    try {
      await deleteDepartment(deptToDelete.id);
      toast.success(`Department "${deptToDelete.name}" and its attached programs deleted.`);
      setDeptToDelete(null);
      window.location.reload();
    } catch (e: any) {
      toast.error("Error deleting department: " + e.message);
    } finally {
      setIsDeletingDept(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Department Tabs Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/40 p-4 rounded-xl border">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Departments & Degree Programs
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure departments, attach degree programs (UG, PG, Diploma), and manage year levels & divisions.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
              <Plus className="w-4 h-4" /> Add Department
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <form action={handleCreateDepartment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department Name</label>
                  <Input name="name" required placeholder="e.g. Dept. of Computer Applications" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Department Code</label>
                  <Input name="code" placeholder="e.g. COMP_APP" />
                </div>
                <Button type="submit" className="w-full">Create Department</Button>
              </form>
            </DialogContent>
          </Dialog>

          {selectedDeptId && (
            <Dialog open={isProgModalOpen} onOpenChange={setIsProgModalOpen}>
              <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
                <Plus className="w-4 h-4" /> Add Program
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Degree Program to {currentDepartment?.name}</DialogTitle>
                </DialogHeader>
                <form action={handleCreateProgram} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Program Title</label>
                    <Input name="title" required placeholder="e.g. BCA, B.Voc, M.Com, BBA-FS" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Program Code</label>
                      <Input name="code" placeholder="e.g. BCA" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Degree Level</label>
                      <select
                        name="degreeLevel"
                        defaultValue="UG"
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="UG">Undergraduate (UG)</option>
                        <option value="PG">Postgraduate (PG)</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Certificate">Certificate</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Duration (Years)</label>
                    <select
                      name="durationYears"
                      defaultValue="3"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="1">1 Year (e.g. Diploma / PG Diploma)</option>
                      <option value="2">2 Years (e.g. Master&apos;s / PG)</option>
                      <option value="3">3 Years (e.g. Standard UG)</option>
                      <option value="4">4 Years (e.g. Engineering / Honors)</option>
                      <option value="5">5 Years (e.g. Integrated Dual Degree)</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Year levels (e.g., FY, SY, TY) and initial Division A will be automatically created.
                    </p>
                  </div>
                  <Button type="submit" className="w-full">Create Program</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {currentDepartment && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5"
              onClick={() => setDeptToDelete({ id: currentDepartment.id, name: currentDepartment.name })}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Department
            </Button>
          )}
        </div>
      </div>

      {/* Department Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {departments.map((dept) => (
          <Button
            key={dept.id}
            variant={selectedDeptId === dept.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedDeptId(dept.id)}
            className="rounded-full text-xs font-medium"
          >
            {dept.name}
            <span className="ml-1.5 px-1.5 py-0.2 bg-background/20 rounded-full text-[10px]">
              {dept.programs?.length || 0}
            </span>
          </Button>
        ))}
      </div>

      {/* Programs List for Selected Department */}
      {currentDepartment && (
        <div className="space-y-4">
          {(!currentDepartment.programs || currentDepartment.programs.length === 0) ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground space-y-2">
                <GraduationCap className="w-10 h-10 mx-auto opacity-40" />
                <p className="font-medium">No degree programs configured under this department yet.</p>
                <p className="text-sm">Click &quot;Add Program&quot; above to create BCA, B.Voc, M.Com, or custom programs.</p>
              </CardContent>
            </Card>
          ) : (
            currentDepartment.programs.map((program: any) => (
              <Card key={program.id} className="overflow-hidden border shadow-sm">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{program.title}</CardTitle>
                          {program.code && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {program.code}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {program.degreeLevel} • {program.durationYears} {program.durationYears === 1 ? "Year" : "Years"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs mt-0.5">
                          {program.yearLevels?.length || 0} Year Levels •{" "}
                          {program.yearLevels?.reduce(
                            (acc: number, yl: any) => acc + (yl.divisions?.length || 0),
                            0
                          )}{" "}
                          Active Divisions
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProgramForDiv(program);
                          setIsDivModalOpen(true);
                        }}
                        className="gap-1 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Division
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteProgram(program.id, program.title)}
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {program.yearLevels?.map((yearLevel: any) => (
                      <div
                        key={yearLevel.id}
                        className="border rounded-lg p-3.5 bg-background shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b pb-2">
                          {editingYearLevel?.id === yearLevel.id ? (
                            <div className="flex items-center gap-1.5 w-full">
                              <Input
                                size={10}
                                className="h-7 text-xs font-semibold"
                                value={editingYearLevel?.title || ""}
                                onChange={(e) =>
                                  setEditingYearLevel((prev) =>
                                    prev ? { ...prev, title: e.target.value } : null
                                  )
                                }
                              />
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSaveYearLevelTitle(yearLevel.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() => setEditingYearLevel(null)}
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="font-semibold text-sm flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                                {yearLevel.title}
                                <span className="text-[11px] text-muted-foreground font-normal">
                                  (Year {yearLevel.yearNumber})
                                </span>
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setEditingYearLevel({
                                    id: yearLevel.id,
                                    title: yearLevel.title,
                                  })
                                }
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Divisions Badges */}
                        <div>
                          <div className="text-[11px] font-medium text-muted-foreground mb-1.5">
                            Cohorts / Divisions:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {yearLevel.divisions?.map((div: any) => (
                              <Badge
                                key={div.id}
                                variant="secondary"
                                className="font-medium text-xs px-2 py-0.5 flex items-center gap-1"
                              >
                                Div {div.name}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDivision(div.id, div.name)}
                                  className="text-muted-foreground hover:text-destructive text-[10px] ml-0.5"
                                >
                                  ✕
                                </button>
                              </Badge>
                            ))}
                            {(!yearLevel.divisions || yearLevel.divisions.length === 0) && (
                              <span className="text-xs text-muted-foreground italic">
                                No divisions
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Division Modal */}
      {selectedProgramForDiv && (
        <Dialog open={isDivModalOpen} onOpenChange={setIsDivModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Division to {selectedProgramForDiv.title}</DialogTitle>
            </DialogHeader>
            <form action={handleCreateDivision} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Target Year Level</label>
                <select
                  name="yearLevelId"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {selectedProgramForDiv.yearLevels?.map((yl: any) => (
                    <option key={yl.id} value={yl.id}>
                      {yl.title} (Year {yl.yearNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Division Name</label>
                <Input name="name" required placeholder="e.g. A, B, C, D" />
                <p className="text-xs text-muted-foreground">
                  You can add unlimited divisions per year level (e.g. Div A, Div B).
                </p>
              </div>
              <Button type="submit" className="w-full">Create Division</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Department Confirmation Alert Modal */}
      {deptToDelete && (
        <Dialog open={!!deptToDelete} onOpenChange={(open) => !open && setDeptToDelete(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Department Confirmation
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <p className="text-sm">
                Are you sure you want to delete <span className="font-bold text-destructive">&quot;{deptToDelete.name}&quot;</span>?
              </p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Irreversible Action
                </p>
                <p>
                  Deleting this department will permanently remove all associated degree programs, academic levels, divisions, and linked course data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeptToDelete(null)}
                disabled={isDeletingDept}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteDepartment}
                disabled={isDeletingDept}
                className="gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeletingDept ? "Deleting..." : "Yes, Delete Department"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
