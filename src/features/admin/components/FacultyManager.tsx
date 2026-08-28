"use client"

import { useState } from "react";
import { User, Profile, FacultyProfile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createFaculty, updateFaculty, deleteFaculty } from "../actions/faculty";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

type FacultyWithProfiles = User & { profile: Profile | null, facultyProfile: FacultyProfile | null };

export function FacultyManager({ 
  initialFaculties 
}: { 
  initialFaculties: FacultyWithProfiles[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyWithProfiles | null>(null);
  
  async function handleCreate(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const employeeId = formData.get("employeeId") as string;
      const initials = formData.get("initials") as string;
      
      await createFaculty({ name, email, phone, employeeId, initials });
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
      const employeeId = formData.get("employeeId") as string;
      const initials = formData.get("initials") as string;
      
      await updateFaculty(editingFaculty.id, { name, phone, employeeId, initials });
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
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" name="email" required placeholder="john@vvm.edu.in" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID</label>
                  <Input name="employeeId" placeholder="e.g. EMP001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initials</label>
                  <Input name="initials" placeholder="e.g. JD" />
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Initials</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialFaculties.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.profile?.name || "N/A"}</TableCell>
                <TableCell>{f.email}</TableCell>
                <TableCell>{f.facultyProfile?.employeeId || "-"}</TableCell>
                <TableCell>{f.facultyProfile?.initials || "-"}</TableCell>
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
                <TableCell colSpan={5} className="text-center py-4">No faculty members found.</TableCell>
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
                <label className="text-sm font-medium">Full Name</label>
                <Input name="name" required defaultValue={editingFaculty.profile?.name || ""} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" name="email" disabled value={editingFaculty.email} className="bg-muted" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" defaultValue={editingFaculty.profile?.phone || ""} placeholder="Optional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee ID</label>
                  <Input name="employeeId" defaultValue={editingFaculty.facultyProfile?.employeeId || ""} placeholder="e.g. EMP001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initials</label>
                  <Input name="initials" defaultValue={editingFaculty.facultyProfile?.initials || ""} placeholder="e.g. JD" />
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
