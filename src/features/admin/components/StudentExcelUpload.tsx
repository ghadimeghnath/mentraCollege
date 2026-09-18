"use client"

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { importStudentsBulk } from "../actions/student";
import { toast } from "sonner";
import { Class, Department, AcademicLevel, Division, AcademicYear } from "@prisma/client";

export function StudentExcelUpload({ 
  classes, 
  academicYears,
  programs
}: { 
  classes: (Class & { department: Department, level: AcademicLevel, division: Division })[],
  academicYears: AcademicYear[],
  programs: any[]
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Extract year levels based on selected program
  const selectedProgramObj = programs.find((p) => p.id === selectedProgramId);
  const yearLevels = selectedProgramObj?.yearLevels?.map((yl: any) => yl.title) || [];

  // Extract available classes (divisions) based on selected program and year level
  const availableDivisions = selectedProgramObj?.divisions?.filter((d: any) => d.yearLevel === selectedYearLevel) || [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Expected columns: Name, Email, Roll Number, Student ID, Phone
      const formatted = data.map((row: any) => {
        // Create a lowercased key version for robust matching
        const lowerRow: Record<string, any> = {};
        for (const key in row) {
          if (row.hasOwnProperty(key)) {
            lowerRow[key.toLowerCase().trim()] = row[key];
          }
        }
        
        return {
          name: lowerRow["name"] || lowerRow["full name"] || "",
          email: lowerRow["email"] || lowerRow["email address"] || "",
          rollNumber: lowerRow["roll number"]?.toString() || lowerRow["roll"]?.toString() || "",
          studentId: lowerRow["student id"]?.toString() || lowerRow["id"]?.toString() || "",
          phone: lowerRow["phone"]?.toString() || lowerRow["phone number"]?.toString() || lowerRow["mobile"]?.toString() || "",
        };
      }).filter(r => r.name && r.email); // Basic validation
      
      setPreviewData(formatted);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (!selectedDivision || !selectedYear) {
      toast.error("Please select both a division and an academic year.");
      return;
    }
    if (previewData.length === 0) {
      toast.error("No valid data to import.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await importStudentsBulk({
        classId: selectedDivision, // Actually passing divisionId
        academicYearId: selectedYear,
        students: previewData
      });
      
      toast.success(`Imported ${result.successful} students. Failed: ${result.failed}`);
      if (result.errors.length > 0) {
        console.error(result.errors);
      }
      setIsOpen(false);
      setFile(null);
      setPreviewData([]);
    } catch (e: any) {
      toast.error("Import failed: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset dependent fields when parent selection changes
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProgramId(e.target.value);
    setSelectedYearLevel("");
    setSelectedDivision("");
  };

  const handleYearLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYearLevel(e.target.value);
    setSelectedDivision("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>
        Import Students (Excel)
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Student Import</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Academic Year</label>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Year</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Degree Program</label>
            <select 
              value={selectedProgramId} 
              onChange={handleProgramChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select Program</option>
              {programs.map((p: any) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year Level</label>
            <select 
              value={selectedYearLevel} 
              onChange={handleYearLevelChange}
              disabled={!selectedProgramId}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Select Year</option>
              {yearLevels.map((yl: any) => (
                <option key={yl} value={yl}>{yl}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Division (Class)</label>
            <select 
              value={selectedDivision} 
              onChange={e => setSelectedDivision(e.target.value)}
              disabled={!selectedYearLevel}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">Select Division</option>
              {availableDivisions.map((d: any) => (
                <option key={d.id} value={d.id}>Div {d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium">Upload Excel File (.xlsx)</label>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            onChange={handleFileUpload}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
          />
          <p className="text-xs text-muted-foreground">Expected columns: Name, Email, Roll Number, Student ID, Phone</p>
        </div>

        {previewData.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium">Preview ({previewData.length} valid records found)</h4>
            <div className="border rounded-md overflow-y-auto max-h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.rollNumber}</TableCell>
                      <TableCell>{row.studentId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport} 
          disabled={isUploading || previewData.length === 0 || !selectedDivision || !selectedYear}
          className="w-full mt-4"
        >
          {isUploading ? "Importing..." : "Confirm Import"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
