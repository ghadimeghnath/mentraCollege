"use client"

import { useState } from "react";
import { User, Profile, FacultyProfile, Department } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createFaculty, updateFaculty, deleteFaculty } from "../actions/faculty";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FacultyWithProfiles = User & { profile: Profile | null, facultyProfile: (FacultyProfile & { department: Department | null }) | null };

export function FacultyManager({ 
  initialFaculties,
  departments 
}: { 
  initialFaculties: FacultyWithProfiles[];
  departments: Department[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyWithProfiles | null>(null);
  
  async function handleCreate(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const initials = formData.get("initials") as string;
      const departmentId = formData.get("departmentId") as string;
      const joiningDate = formData.get("joiningDate") as string;
      
      await createFaculty({ name, email, phone, initials, departmentId, joiningDate });
      setIsOpen(false);
      toast.success("Faculty created.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingFaculty) return;
    try {
      const name = formData.get("name") as string;
      const phone = formData.get("phone") as string;
      const initials = formData.get("initials") as string;
      const departmentId = formData.get("departmentId") as string;
      const joiningDate = formData.get("joiningDate") as string;
      
      await updateFaculty(editingFaculty.id, { name, phone, initials, departmentId, joiningDate });
      setIsEditOpen(false);
      setEditingFaculty(null);
      toast.success("Faculty updated.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this faculty member?")) return;
    try {
      await deleteFaculty(id);
      toast.success("Faculty deleted.");
    } catch (e: any) {
      toast.error("Error: " + e.message);
    }
  }

  function openEdit(faculty: FacultyWithProfiles) {
    setEditingFaculty(faculty);
    setIsEditOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Faculty Directory</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            Add Faculty
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Faculty</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <Input name="name" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                <Input type="email" name="email" required placeholder="john@vvm.edu.in" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
                <Input name="phone" required placeholder="e.g. +91 9876543210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID <span className="text-red-500">*</span></label>
                  <Input name="employeeId" disabled placeholder="Auto-generated" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initials <span className="text-red-500">*</span></label>
                  <Input name="initials" required placeholder="e.g. JD" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
                  <Select name="departmentId" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Department">
                        {(value: string | null) => 
                          value 
                            ? departments.find(d => d.id === value)?.name 
                            : "Select Department"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Joining Date <span className="text-red-500">*</span></label>
                  <Input type="date" name="joiningDate" required />
                </div>
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
              <TableHead className="w-[120px]">Employee ID</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[80px] text-center">Initials</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="w-[220px]">Email</TableHead>
              <TableHead className="w-[120px]">Joined</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialFaculties.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.facultyProfile?.employeeId || "-"}</TableCell>
                <TableCell className="font-medium">{f.profile?.name || "N/A"}</TableCell>
                <TableCell className="text-center">{f.facultyProfile?.initials || "-"}</TableCell>
                <TableCell className="truncate max-w-[200px]" title={f.facultyProfile?.department?.name || "-"}>
                  {f.facultyProfile?.department?.name || "-"}
                </TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>
                  {f.facultyProfile?.joiningDate 
                    ? new Date(f.facultyProfile.joiningDate).toLocaleDateString("en-GB") 
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {initialFaculties.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">No faculty members found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
          </DialogHeader>
          {editingFaculty && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                <Input name="name" required defaultValue={editingFaculty.profile?.name || ""} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                <Input type="email" name="email" disabled value={editingFaculty.email} className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone <span className="text-red-500">*</span></label>
                <Input name="phone" required defaultValue={editingFaculty.profile?.phone || ""} placeholder="e.g. +91 9876543210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID <span className="text-red-500">*</span></label>
                  <Input name="employeeId" disabled defaultValue={editingFaculty.facultyProfile?.employeeId || ""} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initials <span className="text-red-500">*</span></label>
                  <Input name="initials" required defaultValue={editingFaculty.facultyProfile?.initials || ""} placeholder="e.g. JD" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department <span className="text-red-500">*</span></label>
                  <Select name="departmentId" required defaultValue={editingFaculty.facultyProfile?.departmentId || ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Department">
                        {(value: string | null) => 
                          value 
                            ? departments.find(d => d.id === value)?.name 
                            : "Select Department"
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Joining Date <span className="text-red-500">*</span></label>
                  <Input type="date" name="joiningDate" required defaultValue={editingFaculty.facultyProfile?.joiningDate ? new Date(editingFaculty.facultyProfile.joiningDate).toISOString().split('T')[0] : ""} />
                </div>
              </div>
              <Button type="submit" className="w-full">Update</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
