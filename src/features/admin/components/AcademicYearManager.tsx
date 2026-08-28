"use client"

import { useState } from "react";
import { AcademicYear } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createAcademicYear, setAcademicYearActive } from "../actions/academic";
import { toast } from "sonner";

export function AcademicYearManager({ initialData }: { initialData: AcademicYear[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  async function handleSubmit(formData: FormData) {
    try {
      const name = formData.get("name") as string;
      const startDate = formData.get("startDate") as string;
      const endDate = formData.get("endDate") as string;
      const isActive = formData.get("isActive") === "on";
      
      await createAcademicYear({ name, startDate: new Date(startDate), endDate: new Date(endDate), isActive });
      setIsOpen(false);
      toast.success("Academic year created successfully.");
    } catch (e: any) {
      toast.error("Failed to create academic year: " + e.message);
    }
  }

  async function handleSetActive(id: string) {
    try {
      await setAcademicYearActive(id);
      toast.success("Active academic year updated.");
    } catch (e: any) {
      toast.error("Failed to set active year.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
            Add Academic Year
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Academic Year</DialogTitle>
            </DialogHeader>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input name="name" required placeholder="e.g. 2026-2027" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" name="startDate" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" name="endDate" required />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="isActive" id="isActive" className="h-4 w-4" />
                <label htmlFor="isActive" className="text-sm cursor-pointer">Set as active academic year</label>
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
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium">{year.name}</TableCell>
                <TableCell>{new Date(year.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(year.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {year.isActive ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Active</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">Inactive</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {!year.isActive && (
                    <Button variant="outline" size="sm" onClick={() => handleSetActive(year.id)}>
                      Set Active
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {initialData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No academic years found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
