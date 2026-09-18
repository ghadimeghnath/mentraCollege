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
  
  // Program ID state for dynamically loading divisions
  const [selectedFormProgramId, setSelectedFormProgramId] = useState<string>("");
  const selectedProgramObj = programs.find((p) => p.id === selectedFormProgramId);
  const programDivisions = selectedProgramObj?.divisions || [];
  const programYearLevels = selectedProgramObj?.yearLevels || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYearLevelFilter, setSelectedYearLevelFilter] = useState<string>("ALL");
  const [selectedDivFilter, setSelectedDivFilter] = useState<string>("ALL");

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

      const divisionIds = formData.getAll("divisionIds") as string[];

      await createSubject({
        name,
        code: code || undefined,
        description: description || undefined,
        programId: programId || undefined,
        divisionIds: divisionIds.length > 0 ? divisionIds : undefined,
        semNumber,
        hasTheory: modalTheory,
        hasPractical: modalPractical,
      });

      setIsSubjOpen(false);
      setSelectedFormProgramId("");
      const compLabel = modalTheory && modalPractical ? "Both (Theory & Practical)" : modalTheory ? "Theory Only" : "Practical Only";
      toast.success(`Subject(s) "${name}" created with ${compLabel}.`);
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
    if (selectedProgFilter !== "ALL" && s.programId !== selectedProgFilter) return false;
    if (selectedSemFilter !== "ALL" && s.semNumber !== parseInt(selectedSemFilter, 10)) return false;
    if (selectedYearLevelFilter !== "ALL" && s.division?.yearLevel !== selectedYearLevelFilter) return false;
    if (selectedDivFilter !== "ALL" && s.divisionId !== selectedDivFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesCode = s.code?.toLowerCase().includes(q);
      
      const facultyNames = (s.subjectAllocations || []).map((a: any) => a.faculty?.user?.profile?.name || "").join(" ").toLowerCase();
      
      if (!matchesName && !matchesCode && !facultyNames.includes(q)) return false;
    }
    return true;
  });
  
  // Get unique divisions from all programs for the filter
  const allDivisions = Array.from(new Set(programs.flatMap(p => p.divisions || []).map(d => JSON.stringify({id: d.id, name: d.name, yearLevel: d.yearLevel})))).map(s => JSON.parse(s as string));
  const allYearLevels = Array.from(new Set(allDivisions.map(d => d.yearLevel).filter(Boolean)));
  const divisionsForDropdown = selectedYearLevelFilter === "ALL" 
    ? allDivisions 
    : allDivisions.filter(d => d.yearLevel === selectedYearLevelFilter);

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
                    value={selectedFormProgramId}
                    onChange={(e) => setSelectedFormProgramId(e.target.value)}
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

              {programYearLevels.length > 0 && (
                <div className="space-y-4 border rounded-lg p-3 bg-muted/20">
                  <div>
                    <label className="text-sm font-semibold">Select Divisions (Optional)</label>
                    <p className="text-xs text-muted-foreground">Each selected division will have its own subject record created.</p>
                  </div>
                  
                  {programYearLevels.map((yl: any) => (
                    yl.divisions && yl.divisions.length > 0 ? (
                      <div key={yl.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          <h4 className="text-xs font-semibold text-muted-foreground">{yl.title}</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pl-5">
                          {yl.divisions.map((div: any) => (
                            <label key={div.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                name="divisionIds"
                                value={div.id}
                                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                              />
                              <span>Div {div.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null
                  ))}
                </div>
              )}

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

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter Year:</span>
          <select
            value={selectedYearLevelFilter}
            onChange={(e) => {
              setSelectedYearLevelFilter(e.target.value);
              setSelectedDivFilter("ALL");
            }}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
          >
            <option value="ALL">All Years</option>
            {allYearLevels.map((yl: any) => (
              <option key={yl} value={yl}>
                {yl}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter Div:</span>
          <select
            value={selectedDivFilter}
            onChange={(e) => setSelectedDivFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs"
          >
            <option value="ALL">All Divisions</option>
            {divisionsForDropdown.map((d: any) => (
              <option key={d.id} value={d.id}>
                {selectedYearLevelFilter === "ALL" && d.yearLevel ? `${d.yearLevel} - ${d.name}` : d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Input 
            placeholder="Search subjects or faculty..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-64 text-xs" 
          />
        </div>
      </div>

      {/* Subjects Table */}
      <div className="border rounded-xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Code & Name</TableHead>
              <TableHead>Program & Sem</TableHead>
              <TableHead>Div</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Faculty Allocations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((sub) => {
              const allocations = sub.subjectAllocations || [];
              
              return (
                <TableRow key={sub.id}>
                  <TableCell>
                    {sub.code && (
                      <span className="font-mono font-medium text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded mr-2">
                        {sub.code}
                      </span>
                    )}
                    <span className="font-semibold text-sm">{sub.name}</span>
                    {sub.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">
                        {sub.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      {sub.program ? (
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {sub.program.title}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Global</span>
                      )}
                      {sub.semNumber && (
                        <span className="text-xs text-muted-foreground font-medium">
                          Semester {sub.semNumber}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.division ? (
                      <Badge variant="outline" className="font-semibold bg-muted/30">
                        {sub.division.yearLevel ? `${sub.division.yearLevel} - Div ${sub.division.name}` : `Div ${sub.division.name}`}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5 items-start">
                      {sub.hasTheory && (
                        <Badge className="bg-blue-600/10 text-blue-700 hover:bg-blue-600/20 text-[10px] px-1.5 py-0 border-0">
                          Theory
                        </Badge>
                      )}
                      {sub.hasPractical && (
                        <Badge className="bg-purple-600/10 text-purple-700 hover:bg-purple-600/20 text-[10px] px-1.5 py-0 border-0">
                          Practical
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {allocations.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {allocations.map((alloc: any) => (
                          <div key={alloc.id} className="flex items-center gap-1.5 text-xs">
                            <Badge variant="outline" className="text-[9px] px-1 h-4 uppercase">
                              {alloc.componentType.substring(0,2)}
                            </Badge>
                            <span className="font-medium truncate max-w-[150px]">
                              {alloc.faculty?.user?.profile?.name || "Unassigned"}
                            </span>
                            {alloc.faculty?.initials && (
                              <span className="text-muted-foreground font-mono bg-muted px-1 rounded text-[10px]">
                                {alloc.faculty.initials}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No allocations</span>
                    )}
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
              );
            })}
            {filteredSubjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
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
